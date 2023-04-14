function getDateStringForLogFile() {
    const dateString = new Date().toLocaleDateString();
    const dateArr = dateString.split('/');
    return `${dateArr[2]}-${dateArr[0]}-${dateArr[1]}`;
}

module.exports = {
    getDateStringForLogFile,
};
