import React, { useState, useEffect } from "react";
import FormattedDate from "./FormattedDate";
import { useNavigate, Outlet } from "react-router-dom";

function Layout() {
  const navigate = useNavigate();

  const [count, setCount] = useState(0);
  const [obituaries, setObituaries] = useState([]);
  const [name, setName] = useState("");
  const [bornDate, setBornDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchObituaries = async () => {
      try {
        const res = await fetch(
          "https://tbrhq25b4pkqbyqsrw6mzm3r7i0lqnvr.lambda-url.ca-central-1.on.aws/",
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (res.ok) {
          const obituariesData = await res.json();
          setObituaries(obituariesData);
        }
      } catch (error) {
        console.error("Error fetching obituaries", error);
      }
    };

    fetchObituaries();
  }, []);

  useEffect(() => {
    const storedObituaries = JSON.parse(localStorage.getItem("obituaries"));

    if (storedObituaries) {
      setObituaries(storedObituaries);
    }
  }, []);

  const onSubmitForm = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("born", bornDate);
    formData.append("death", deathDate);

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const fileData = reader.result;
      const newObituary = { fileData, name, bornDate, deathDate };
      setObituaries([...obituaries, newObituary]);
    };

    try {
      const res = await fetch(
        "https://idhchxrnoy3cvytepauek44lwe0vgsza.lambda-url.ca-central-1.on.aws/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (res.ok) {
        const responseBody = await res.json();
        setObituaries([...obituaries, responseBody]);
        console.log(responseBody);
      } else {
        throw new Error("Failed to upload obituary.");
      }
    } catch (error) {
      console.error("Error uploading obituary", error);
    }
  };

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const toggleObituary = (index) => {
    setObituaries((prevObituaries) =>
      prevObituaries.map((obituary, i) =>
        i === index ? { ...obituary, collapsed: !obituary.collapsed } : obituary
      )
    );
  };

  const obituaryList = obituaries.map((obituary, index) => (
    <obituary
      obituary={obituary}
      index={index}
      key={index}
      toggleObituary={toggleObituary}
    />
  ));

  return (
    <div>
      <header>
        <h1 className="header">The Last Show</h1>
        <div className="create-button">
          <button
            type="button"
            className="add-ob"
            onClick={() => {
              display();
              navigate("/obituaries/create");
            }}
          >
            &#43; New Obituary
          </button>
        </div>
      </header>
  
      <main className="obituaries">
        <div className="obituary-cont">
          <Outlet
            context={[
              obituaryList,
              onSubmitForm,
              display,
              onFileChange,
              name,
              setName,
              bornDate,
              setBornDate,
              deathDate,
              setDeathDate,
            ]}
          />
        </div>
      </main>
    </div>
  );
}

export default Layout;
