Vue.createApp({
    data() {
        return {
            transactions: [],
            title: '',
            amount: '',
            type: '',
            date: '',
            totalIncome: 0,
            totalExpense: 0,
            totalBalance: 0,
            editingIndex: null,
            editingTransaction: {},
            sortMode: '',
        };
    },
    methods: {
        fetchData() {
            fetch('transactions.json')
                .then(response => response.json())
                .then(data => {
                    let transactionsFromJson = data.map(transaction => ({ ...transaction, fromJson: true }));
        
                    const storedTransactions = localStorage.getItem('transactions');
                    if (storedTransactions) {
                        const userAddedTransactions = JSON.parse(storedTransactions);
                        transactionsFromJson = transactionsFromJson.concat(userAddedTransactions);
                    }
        
                    this.transactions = transactionsFromJson;
                    this.calculateTotal();
                    this.drawChart();
                })
                .catch(error => {
                    console.error('Error fetching transactions:', error);
                });
        },
        addTransaction() {
            const transaction = {
                title: this.title,
                amount: parseFloat(this.amount),
                type: this.type,
                date: this.date,
                fromJson: false
            };
        
            this.transactions.push(transaction);
            localStorage.setItem('transactions', JSON.stringify(this.transactions.filter(t => !t.fromJson)));
            this.calculateTotal();
            this.resetForm();
            this.drawChart();
        },
        resetForm() {
            this.title = '';
            this.amount = '';
            this.type = '';
            this.date = '';
        },
        calculateTotal() {
            this.totalIncome = this.transactions
                .filter(transaction => transaction.type === 'income')
                .reduce((total, transaction) => total + transaction.amount, 0);

            this.totalExpense = this.transactions
                .filter(transaction => transaction.type === 'expense')
                .reduce((total, transaction) => total + transaction.amount, 0);

            this.totalBalance = this.totalIncome - this.totalExpense;
        },
        removeTransaction(index) {
            this.transactions.splice(index, 1);
            localStorage.setItem('transactions', JSON.stringify(this.transactions.filter(t => !t.fromJson)));
            this.calculateTotal();
            this.drawChart();
        },
        editTransaction(index) {
            this.editingIndex = index;
            this.editingTransaction = { ...this.transactions[index] };
        },
        saveTransaction(index) {
            this.transactions[index] = { ...this.editingTransaction };
            localStorage.setItem('transactions', JSON.stringify(this.transactions.filter(t => !t.fromJson)));
            this.editingIndex = null;
            this.calculateTotal();
            this.drawChart();
        },
        cancelEdit() {
            this.editingIndex = null;
        },
        drawChart() {
            const canvas = document.getElementById('myChart');
            const ctx = canvas.getContext('2d');
        
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        
            const incomeColor = 'green';
            const expenseColor = 'red';
            ctx.lineWidth = 4;
        
            const transactionsByMonth = {};
        
            this.transactions.forEach(transaction => {
                const month = new Date(transaction.date).getMonth();
                if (!transactionsByMonth[month]) {
                    transactionsByMonth[month] = {
                        income: 0,
                        expense: 0
                    };
                }
                if (transaction.type === 'income') {
                    transactionsByMonth[month].income += transaction.amount;
                } else {
                    transactionsByMonth[month].expense += transaction.amount;
                }
            });
        
            const maxTotal = Math.max(...Object.values(transactionsByMonth).map(month => month.income + month.expense));
        
            const segmentWidth = canvas.width / (Object.keys(transactionsByMonth).length * 2);
        
            ctx.font = '15px Arial';
        
            Object.keys(transactionsByMonth).forEach((month, index) => {
                const xPosition = segmentWidth * (2 * index + 1);
                const incomeHeight = (canvas.height * transactionsByMonth[month].income) / maxTotal;
                const expenseHeight = (canvas.height * transactionsByMonth[month].expense) / maxTotal;
        
                if (transactionsByMonth[month].income > 0) {
                    ctx.fillStyle = incomeColor;
                    ctx.fillRect(xPosition - segmentWidth / 4, canvas.height - incomeHeight, segmentWidth / 2, incomeHeight);
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.fillText(transactionsByMonth[month].income, xPosition - segmentWidth / 4, canvas.height - incomeHeight - 5);
                }
        
                if (transactionsByMonth[month].expense > 0) {
                    ctx.fillStyle = expenseColor;
                    ctx.fillRect(xPosition + segmentWidth / 4, canvas.height - expenseHeight, segmentWidth / 2, expenseHeight);
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.fillText(transactionsByMonth[month].expense, xPosition + segmentWidth / 4, canvas.height - expenseHeight - 5);
                }
            });
        }
    },
    computed: {
        sortedTransactions() {
            let sorted = [...this.transactions];
            if (this.sortMode === 'lowToHigh') {
                sorted.sort((a, b) => a.amount - b.amount);
            } else if (this.sortMode === 'highToLow') {
                sorted.sort((a, b) => b.amount - a.amount);
            } else if (this.sortMode === 'oldToNew') { 
                sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            } else if (this.sortMode === 'newToOld') {
                sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            }
            return sorted;
        }
    },
    created() {
        this.fetchData();
    },

}).mount('#app');
