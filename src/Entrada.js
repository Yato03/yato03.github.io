import React from "react";


class Entrada extends React.Component{

    constructor(props){
        super(props);
        this.state = {index: this.props.index};
    }

    render(){
        const {handleHidden} = this.props;
            
        return (
            <div className="entrada-div" onClick={handleHidden.bind(this, this.state.index)}>
                <div className="img-entrada">
                    <img src={this.props.img}  alt="foto"/>
                </div>
                <div className="texto-entrada">
                    <div className="titulo">
                        <h3>{this.props.titulo}</h3>
                        <p className="fecha">{this.props.fecha}</p>
                    </div>
                    <p className="descripcion">{this.props.descripcion}</p>
                </div>
            </div>
        );
    }
}

export default Entrada;