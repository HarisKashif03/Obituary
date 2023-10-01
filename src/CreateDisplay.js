import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { currentDate } from "./currentDate";

function CreateDisplay() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [bornDate, setBornDate] = useState("");
  const [deathDate, setDeathDate] = useState(currentDate());
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInput = useRef(null);

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleClick = (e) => {
    e.preventDefault();
    fileInput.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("bornDate", bornDate);
    formData.append("deathDate", deathDate);
    if (imageFile) {
      formData.append("imageFile", imageFile);
    }
    try {
      const response = await fetch("/api/obituaries", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        navigate("/obituaries");
      } else {
        console.error(response);
      }
    } catch (error) {
      console.error(error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="create-ds">
      <div className="stop-prop">
        <button className="cancel" onClick={(e) => {
          e.stopPropagation();
          navigate("/obituaries")
        }}>&#x2715;</button>
      </div>
      <form method="GET" className="form"
        onSubmit={async (e) => {
          setIsSubmitting(true);
          e.preventDefault();
          try {
            await onSubmitForm(e);
            setIsSubmitting(false);
            navigate("/obituaries");
          } catch (error) {
            console.error(error);
          }
        }} >
  
        <div className="create-head">
          <h1 className="create-title">Create A New Obituary</h1>
          <img src="https://i.imgur.com/Ndxe1Qit.jpg" alt="border" className="cr-img"></img>
        </div>
  
        <div className="create">
          <div className="add-file">
            <label htmlFor="file-input" onClick={handleClick} className="file-input2">
              {labelText}
            </label>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              required
              ref={fileInput}
              style={{ display: "none" }}
              onChange={handleInputChange}
            />
          </div>
  
          <div className="full-name">
            <input
              type="text"
              required
              onChange={(e) => setName(e.target.value)}
              placeholder="Name of The Deceased"
            />
          </div>
  
          <div className="dates">
            <div className="birth">
              <label htmlFor="birth-date">Born: </label>
              <input
                id="birth-date"
                type="datetime-local"
                onChange={(e) => setBornDate(e.target.value)}
                required
              />
            </div>
  
            <div className="death">
              <label htmlFor="death-date">Died: </label>
              <input
                id="death-date"
                type="datetime-local"
                value={currentDate()}
                onChange={(e) => setDeathDate(e.target.value)}
                required
              />
            </div>
          </div>
  
          <input className={`${isSubmitting ? "submitting" : "notSubmitting"}`} type="submit" disabled={isSubmitting} value={`${isSubmitting ? "Please Wait. It's Not Like They're Going to be Late..." : "Write Obituary"}`} />
        </div>
      </form>
    </div>
  )
}
  
  
export default CreateDisplay;