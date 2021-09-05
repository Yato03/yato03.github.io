import React,{useState} from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect
  } from "react-router-dom";  
import Entrada from './Entrada';
import Entradas from './Entradas';
import App from './App';
//Entradas
import Resolution from './Entradas/Resolution'

let nEntradas = Object.keys(Entradas).length;   //numero total de entradas
let entradasEnPagina;                           //entradas que caben como maximo en la pagina
let nPaginas;                                   //numero de paginas totales
let nEntradasUltimaPg;                          //numero de entradas que hay en la ultima pagina
let paginaActual;                               //numero de la pg actual
let nEntradasPgActual;                          //numero de entradas de la pg actual
let count;                                      //elemento desde el cual empieza a renderizar las entradas
let boton;

paginaActual = 1;

/*saber si estamos en movil u ordenador y 
seteamos el numero de entradas que podemos renderizar por pagina*/

//console.log("Width: " + window.screen.width);

if(window.screen.width > 1000){
    //console.log("Ordenador");
    entradasEnPagina = 5;
    boton = "btn btn-lg btn-light";
}
else{
    //console.log("Movil");
    entradasEnPagina = 4;
    boton = "btn btn-sm btn-light";
}

//calcular el numero de paginas necesarias
nPaginas = Math.floor(nEntradas / entradasEnPagina);
nEntradasUltimaPg = nEntradas%entradasEnPagina;

if(nEntradasUltimaPg !== 0){
    nPaginas++;
}

class Root extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            arrayEntradas: []
        };
    }


    handleHidden = (index, e) =>{
        //console.log(index);
        window.location.href = "/" + Entradas[index]['titulo'];
    }

    aRender(){


        if((paginaActual >= nPaginas) /*&& (nPaginas !== 1)*/){
            nEntradasPgActual = nEntradasUltimaPg;
        }
        else{
            nEntradasPgActual = entradasEnPagina;
        }

        //count = ((paginaActual - 1) * entradasEnPagina) + nEntradasPgActual;
        count = nEntradas - ((paginaActual - 1) * entradasEnPagina);

        let a = [];

        for(var i = count; i > (count-nEntradasPgActual); i--){

            a.push(
                <Entrada 
                        index={i}
                        titulo={Entradas[i]['titulo']}
                        descripcion={Entradas[i]['descripcion']}
                        fecha={Entradas[i]['fecha']}
                        img={Entradas[i]['img']}
                        handleHidden={this.handleHidden}
                />
            );
            /*console.log(
                "numero de entradas: " + nEntradas + "\n" +
                "entradas que caben en la pagina: " + entradasEnPagina + "\n" +
                "numero de paginas totales: " + nPaginas + "\n" +
                "entradas de la ultima pagina: " + nEntradasUltimaPg + "\n" + 
                "pagina actual: " + paginaActual + "\n" + 
                "numero de entradas de la pagina actual: " + nEntradasPgActual + "\n" + 
                "count: " + count
            );*/
        }
        return a;
    }

    render(){
        if(this.state.arrayEntradas.length == 0){
            this.setState({arrayEntradas:this.aRender()});
        }
        
        return (
            <span>
                <Router>
                    <Switch>
                        <Route path="/inicio">
                            <span>{this.state.arrayEntradas}</span>  
                            <div className="pg-controller">
                                <button type="button" className={boton} onClick={() => {
                                    if(paginaActual !== 1){
                                        this.setState({arrayEntradas: []});
                                        paginaActual--;
                                        //console.log("Atras: " + paginaActual);
                                        this.render();
                                    }
                                }   
                                }>Atras</button>

                                <button type="button" className={boton} onClick={() => {
                                    if(paginaActual < nPaginas){
                                        this.setState({arrayEntradas: []});
                                        paginaActual++;
                                        //console.log("Siguiente: " + paginaActual);
                                        this.render();
                                    }
                                }   
                                }>Siguiente</button>
                            </div>
                        </Route>
                        <Route path="/App" exact children={<App/>} />
                        <Route path="/Resolution" exact children={<Resolution/>} />
                        <Route path="*" children={<Redirect to="/inicio" />} />
                    </Switch>
                </Router>
                    
            </span>
        );
    }
}

export default Root;