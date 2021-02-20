const Modal = {
    open() {
        //Abrir modal
        //Adicionar classe active ao modal
        document
                .querySelector('.field')
                .innerHTML = ""
        document
            .querySelector('.modal-overlay')
            .classList.add('active');

    },
    close() {
        //Fechar o modal
        //Remover a classe active do modal
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""

        document
                .querySelector('.field')
                .innerHTML = ""
        document
            .querySelector('.modal-overlay')
            .classList.remove('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transaction")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transaction", JSON.stringify(transactions))
    }
}

const Transaction = {   
    all: Storage.get(),
    
    add(transaction) {
        Transaction.all.push(transaction);

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        
        let income = 0;
        // pegar todas as transações
        // para cada transação
        Transaction.all.forEach(transaction => {
            // se ela for maior que zero
            if(transaction.amount > 0) {
                // somar a uma variável
                income += transaction.amount;
            }
        })
        // retornar a variável
        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {

        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHtmlTransaction(transaction, index);
        tr.dataset.index = index
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHtmlTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img id="minus" onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `

        return html
    },

    updateBalance() {
        document
        .querySelector('#incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
        .querySelector('#expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
        .querySelector('#totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())

        if(Transaction.total() < 0) {
            document
            .querySelector('.card.total')
            .classList.add('negative')
        } else {
            document
            .querySelector('.card.total')
            .classList.remove('negative')
        }
      
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        value = Number(value) * 100
       
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")

        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const {description, amount, date} = Form.getValues()

        if(
            description.trim() === "" || 
            amount.trim() ==="" || 
            date.trim() === "" ) {
                throw new Error("*Por favor, preencha todos os campos")
        }
    },

    formatValues(){
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)
        return {
            description,
            amount,
            date,
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            //alert(error.message)

            document
                .querySelector('.field')
                .classList.add('alert')
            
            document
                .querySelector('.field')
                .innerHTML = `${error.message}`
        }   

    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
            
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()




