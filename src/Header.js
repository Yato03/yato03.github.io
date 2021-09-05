import icon from './img/YatoDev.jpg';
import gmail from './img/gmail.png';
import github from './img/github.png';
import instagram from './img/instagram.png';

function CopyEmail(){
    var userGmail = "miguelhs3523@gmail.com";
    navigator.clipboard.writeText(userGmail);
    alert('Mi correo esta copiado en tu portapapeles (;');
}

function Header() {
    return (
        <div className="container-header">
            <div className="icon-div"><img className="icon" alt="icon" src={icon} /></div>
            <div className="p-div">
                <h5>
                    <b>Miguel Hernández</b>
                </h5>
                <p>
                    Estudiante de Ingeniería de Software en US
                </p>
                </div>
            <div className="redes-div">
                <div className="dropdown">
                    <a className="btn btn-secondary dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-bs-toggle="dropdown" aria-expanded="false">
                        Redes
                    </a>
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                        <li><a className="dropdown-item" href="https://github.com/Yato03" target="_blank">Github</a></li>
                        <li><a className="dropdown-item" href="https://www.instagram.com/yato_03/" target="_blank">Instagram</a></li>
                        <li><a className="dropdown-item" href="#" target="_blank">Gmail</a></li>
                    </ul>
                </div>
                <div className="redes-icons">
                    <div><a href="https://github.com/Yato03" target="_blank"><img src={github}/></a></div>
                    <div><a href="https://www.instagram.com/yato_03/" target="_blank"><img src={instagram}/></a></div>
                    <div><a href="#"><img src={gmail} onClick={CopyEmail}/></a></div>
                </div>
            </div>
        </div>
    );
}

export default Header;