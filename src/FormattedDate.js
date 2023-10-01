const formatDate = (when) => {
    const date = new Date(when);
    const year = date.getFullYear();
    const month = date.toLocaleString("default", { month: "long" });
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${month} ${day}, ${year}`;
};

function FormattedDate({ date }) {
    return <p className="note-when">{formatDate(date)}</p>;
}

export default FormattedDate;
