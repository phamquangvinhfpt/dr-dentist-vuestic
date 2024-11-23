import { TLineChartData } from '../types'

export const lineChartData: TLineChartData = {
  labels: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  datasets: [
    {
      label: 'Yearly Deposit',
      backgroundColor: 'rgba(75,192,192,0.4)',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Random values
    },
  ],
}
