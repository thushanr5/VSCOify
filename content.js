function dateFormatter(dateText) {
    // Create a Date object from the provided dateText
    const date = new Date(dateText);
    // Format the date to YYYY-MM-DD
    let formattedDate = date.toISOString().slice(0, 10);
    
    return formattedDate;    
}
