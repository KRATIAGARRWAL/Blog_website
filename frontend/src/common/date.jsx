let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
let days=["Sunday", "Monday", "Tuesday", "Wednesday", "Thrusday", "Friday", "Saturday"]

export const getDay = (timestamp)=>{
    let date = new Date(timestamp)

    return `${date.getDate()} ${months[date.getMonth()]}`
}