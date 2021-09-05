import React, { useState } from 'react';

function Navigator() {
  const  [input, setInput] = useState("");

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="/inicio">YatoDev</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="/inicio">Inicio</a>
            </li>
          </ul>
          {/*
            <form className="d-flex">
              <input className="form-control me-2" type="search" value={input} onInput={e => setInput(e.target.value)} placeholder="Busca lo que quieras" aria-label="Search"/>
            </form>
          */}
        </div>
      </div>
    </nav>
  );    
}

export default Navigator;