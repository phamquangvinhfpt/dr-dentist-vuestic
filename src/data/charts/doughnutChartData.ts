import { TDoughnutChartData } from '../types'

export const profitBackground = '#154EC1'
export const expensesBackground = '#fff'
export const earningsBackground = '#ECF0F1'
// gray
export const cancelledBackground = '#BDC3C7'
// green
export const completedBackground = '#2ECC71'
// red
export const failedBackground = '#E74C3C'

export const doughnutChartData: TDoughnutChartData = {
  labels: ['Cancel Bookings', 'Completed Bookings', 'Failed Bookings'],
  datasets: [
    {
      label: 'Yearly Breakdown',
      backgroundColor: [cancelledBackground, completedBackground, failedBackground],
      data: [432, 167, 123],
    },
  ],
}
