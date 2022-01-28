let twig = require('twig');
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let session = require('express-session');
let mysql = require('mysql');
let db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "sonolight"
});

db.connect(function(err) {
    if (err) throw err;
    console.log("Connecté à la base de données MYSQL");
})



const { request } = require('http');
app.use('/assets', express.static('public'));
app.set('view engine', 'twig');
app.set("twig option", {
    allow_async: true,
    strict_variables: false
});

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

app.get('/', (resquest, response) => {
    if (resquest.session.error) {
        response.locals.error = resquest.session.error;
        resquest.session.error = undefined;
    }
    response.render('inscription/index', {
        title: 'salut',
        nav: 'barre de navigation',
        main: 'partie principale',
        footer: 'pied de page'
    })
})

app.post('/profil/post', function(resquest, response) {
    console.log(resquest.body);
    if (resquest.body.login === "login") {
        resquest.session.error = "il y a une erreur!";
        response.redirect('/');
    } else {
        let post = [resquest.body.login, resquest.body.mdp];
        db.query("SELECT * FROM utilisateur INNER JOIN privilege on utilisateur.TYPE = privilege.TYPE where LOGIN = ? and MDP = ? ", [resquest.body.login, resquest.body.mdp],
            function(error, results, fields) {
                if (results.length == 1) {
                    console.log(results[0].TYPE);
                    if (results[0].TYPE == 1) {
                        resquest.session.type = 1;
                        resquest.session.user = results[0].LOGIN;
                        response.send('profil/administration');
                    } else {
                        resquest.session.type = 0;
                        resquest.session.user = results[0].GOGIN;
                        response.send('profil/post');
                        
                        
                    }
                } else if (results.length > 1) {
                    resquest.session.error = "Changer de login!";
                    response.redirect('/');
                } else {
                    db.query("INSERT INTO utilisateur (TYPE, LOGIN, MDP) values( ? , ? , ? )", [0, resquest.body.login, resquest.body.mdp], function(error,
                        results, fields) {
                        if (results.affectedRows == 1) {
                            response.send('profil/post');
                            console.log("test" + results.affectedRows);
                            resquest.session.error = "Enregistrer!";
                        }
                    });
                }
            });
    }
    response.send('welcome, ' + resquest.body.mdp)

})

app.listen(8080);