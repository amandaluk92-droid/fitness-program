import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { requireAdmin } from '@/lib/admin'
import { getSubscriptionFinancialReport } from '@/lib/reports/subscription-financial'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

function formatCurrencyHKD(value: number): string {
  return `HK$${value.toFixed(2)}`
}

export async function GET(request: NextRequest) {
  const session = await getSession()
  const unauth = requireAdmin(session)
  if (unauth) return unauth

  const { searchParams } = new URL(request.url)
  const format = searchParams.get('format') ?? ''

  if (format !== 'xlsx' && format !== 'pdf') {
    return NextResponse.json(
      { error: 'Invalid format. Use format=xlsx or format=pdf' },
      { status: 400 }
    )
  }

  try {
    const { rows, totals } = await getSubscriptionFinancialReport()

    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new()
      const sheetData = [
        ['Trainer name', 'Email', 'Total charged (HK$)', 'Stripe fee (HK$)', 'Net remaining (HK$)'],
        ...rows.map((r) => [
          r.trainerName,
          r.trainerEmail,
          r.totalCharged,
          r.stripeFee,
          r.netRemaining,
        ]),
        ['Total', '', totals.totalCharged, totals.totalStripeFee, totals.totalNetRemaining],
      ]
      const ws = XLSX.utils.aoa_to_sheet(sheetData)
      XLSX.utils.book_append_sheet(wb, ws, 'Subscription financial report')
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      const filename = `subscription-financial-report-${new Date().toISOString().slice(0, 10)}.xlsx`
      return new NextResponse(buffer, {
        headers: {
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('Subscription financial report', 14, 20)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)

    const tableHead = [['Trainer name', 'Email', 'Total charged (HK$)', 'Stripe fee (HK$)', 'Net remaining (HK$)']]
    const tableBody = rows.map((r) => [
      r.trainerName,
      r.trainerEmail,
      formatCurrencyHKD(r.totalCharged),
      formatCurrencyHKD(r.stripeFee),
      formatCurrencyHKD(r.netRemaining),
    ])
    const tableFoot = [['Total', '', formatCurrencyHKD(totals.totalCharged), formatCurrencyHKD(totals.totalStripeFee), formatCurrencyHKD(totals.totalNetRemaining)]]

    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      foot: tableFoot,
      startY: 34,
    })

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
    const filename = `subscription-financial-report-${new Date().toISOString().slice(0, 10)}.pdf`
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export subscription financial report error:', error)
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    )
  }
}
