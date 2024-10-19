export function formatDate(tipo,date) {
    if (!(date instanceof Date)) {
        date = new Date(date)
    }
    
    switch(tipo){
        case 'YYYY-MM-DD HH:MM':
            return `${date.getFullYear()}-${`00${date.getMonth() + 1}`.slice(-2)}-${`00${date.getDate()}`.slice(-2)}T${`00${date.getHours()}`.slice(-2)}:${`00${date.getMinutes()}`.slice(-2)}`
        case 'DD/MM/YYYY':
            return `${`00${date.getDate()}`.slice(-2)}/${`00${date.getMonth() + 1}`.slice(-2)}/${date.getFullYear()}`; 
        default:
            return date.toString()
    }
}