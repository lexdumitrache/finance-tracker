import Papa from 'papaparse';
    import { Chart } from 'chart.js/auto';

    const categories = {
      'Groceries': ['supermarket', 'grocery'],
      'Transport': ['fuel', 'bus', 'train', 'taxi'],
      'Entertainment': ['cinema', 'netflix', 'spotify'],
      'Dining': ['restaurant', 'cafe', 'bar'],
      'Utilities': ['electricity', 'water', 'internet'],
      'Other': []
    };

    let chart;

    document.getElementById('csvFile').addEventListener('change', (event) => {
      const file = event.target.files[0];
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          const expenses = results.data.map(expense => {
            const category = Object.entries(categories).find(([_, keywords]) => 
              keywords.some(keyword => expense.description.toLowerCase().includes(keyword))
            )?.[0] || 'Other';
            return { ...expense, category, amount: parseFloat(expense.amount) };
          });

          updateSummary(expenses);
          renderChart(expenses);
          renderTable(expenses);
        }
      });
    });

    function updateSummary(expenses) {
      const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const thisMonth = expenses
        .filter(expense => new Date(expense.date).getMonth() === new Date().getMonth())
        .reduce((sum, expense) => sum + expense.amount, 0);
      const mostSpent = Object.entries(
        expenses.reduce((acc, expense) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

      document.getElementById('totalExpenses').textContent = `$${total.toFixed(2)}`;
      document.getElementById('monthlyExpenses').textContent = `$${thisMonth.toFixed(2)}`;
      document.getElementById('mostSpent').textContent = mostSpent;
    }

    function renderChart(expenses) {
      const ctx = document.getElementById('expenseChart').getContext('2d');
      const data = Object.entries(
        expenses.reduce((acc, expense) => {
          acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
          return acc;
        }, {})
      );

      if (chart) chart.destroy();

      chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: data.map(([category]) => category),
          datasets: [{
            data: data.map(([_, amount]) => amount),
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    function renderTable(expenses) {
      const tbody = document.querySelector('#expenseTable tbody');
      tbody.innerHTML = expenses
        .map(expense => `
          <tr>
            <td>${expense.date}</td>
            <td>${expense.description}</td>
            <td>${expense.category}</td>
            <td>$${expense.amount.toFixed(2)}</td>
          </tr>
        `)
        .join('');
    }
