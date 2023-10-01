import React, { useState, useEffect } from "react";
import FormattedDate from "./FormattedDate";
import { useNavigate, Outlet } from "react-router-dom";

function Layout() {
    const navigate = useNavigate();

    const [obituaries, setObituaries] = useState([]);
    const [name, setName] = useState("");
    const [bornDate, setBornDate] = useState("");
    const [deathDate, setDeathDate] = useState("");
    const [file, setFile] = useState(null);

    useEffect(() => {
        const fetchObituaries = async () => {
            try {
                const res = await fetch("https://tbrhq25b4pkqbyqsrw6mzm3r7i0lqnvr.lambda-url.ca-central-1.on.aws/",
                    {
                        headers: {
                            "Content-Type": "application/json",
                        }
                    });

                if (res.ok) {
                    const obituariesData = await res.json();
                    setObituaries(obituariesData);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchObituaries();
    }, []);

    useEffect(() => {
        const currentObituaries = JSON.parse(localStorage.getItem("obituaries"));
        if (currentObituaries) {
            setObituaries(currentObituaries);
        }
    }, []);

    const handleNameChange = (event) => {
        setName(event.target.value);
    };

    const handleBornDateChange = (event) => {
        setBornDate(event.target.value);
    };

    const handleDeathDateChange = (event) => {
        setDeathDate(event.target.value);
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", name);
        formData.append("born", bornDate);
        formData.append("death", deathDate);

        try {
            const res = await fetch("https://example.com/api/obituaries", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                const newObituary = { name, bornDate, deathDate };
                setObituaries([...obituaries, newObituary]);
            } else {
                console.error(res.status);
            }
        } catch (error) {
            console.error(error);
        }
    };

  async function uploadObituary(jsonData) {
      try {
        const response = await fetch("https://idhchxrnoy3cvytepauek44lwe0vgsza.lambda-url.ca-central-1.on.aws/", {
          method: "POST",
          body: jsonData,
        });
        
        if (!response.ok) {
          throw new Error("Failed to upload obituary.");
        }
    
        const responseBody = await response.json();
        setObituaries([...obituaries, responseBody]);
        console.log(responseBody);
        
      } catch (error) {
        throw error;
      }
    }
    
    function onFileChange(e) {
      console.log(e.target.files);
      setFile(e.target.files[0]);
    }
    
    function display() {
      setCount((count) => (count === 0 ? 1 : 0));
    }
    
    function Obituaries({ obituaries }) {
      const [selectedObituary, setSelectedObituary] = useState(null);
    
      function handleObituaryClick(obituary) {
        setSelectedObituary(obituary);
      }
    
      return (
        <div>
          <header>
            <h1>The Final Show</h1>
            <button onClick={() => { setSelectedObituary(null); }}>+ New Obituary</button>
          </header>
    
          <main>
            <div className="obituary-list">
              {obituaries.map((obituary, index) => (
                <div
                  key={index}
                  className={`obituary ${obituary === selectedObituary ? 'selected' : ''}`}
                  onClick={() => handleObituaryClick(obituary)}
                >
                  <img src={obituary.image} alt={`Obituary ${index}`} />
                  <h2>{obituary.name}</h2>
                  <p>{obituary.birthDate} - {obituary.deathDate}</p>
                </div>
              ))}
            </div>
    
            {selectedObituary && (
              <div className="obituary-details">
                <img src={selectedObituary.image} alt={`Obituary ${obituaries.indexOf(selectedObituary)}`} />
                <h2>{selectedObituary.name}</h2>
                <p>{selectedObituary.birthDate} - {selectedObituary.deathDate}</p>
                <p>{selectedObituary.memoir}</p>
                <audio controls>
                  <source src={selectedObituary.audio} type="audio/mpeg" />
                </audio>
              </div>
            )}
          </main>
        </div>
      );
    }
}

export default Obituaries;