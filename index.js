import express from "express";
import bodyParser from "body-parser";
import city from "list-of-moroccan-cities"
import pg from "pg"



const app = express();
const port = 3000;
const citiesOfMorocco = city
const db=new pg.Client({
user :"postgres",
host:"localhost",
database:"arwastore",
password:"ARWA@2024",
port:5432
});
db.connect();


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

async function getClientsList(){
  const clients =[];
  const result =await db.query("SELECT * FROM clients");
  result.rows.forEach(client => clients.push(client));
  return clients; 
}

async function getOrdersList(){
  const orders =[];
  const result =await db.query("SELECT name as client , nbr_articl , montant , avance , livraison , rest , discription , traking_nbr , date FROM clients JOIN orders on clients.id = client_id");
  result.rows.forEach(order => orders.push(order));                      
  return orders; 
}

async function getCompta(){
  const compta =[];
  const result =await db.query("SELECT barid_bank , cih_bank , chaabi_bank , cash ,cash_beyou ,fournisseur ,commande_impaye ,commande_livraison ,capital_reel ,capital_general ,date FROM compta ORDER BY id DESC LIMIT 5");
  result.rows.forEach(row => compta.push(row));                      
  return compta; 
}

const ficheCompta=[]
let is_invalid =""
let message = ""

// Get Routes
app.get("/", (req, res) => {
  res.render("index.ejs");
});
app.get("/clients", (req, res) => {
  res.render("clients.ejs");
});

app.get("/ajouterClients", (req, res) => {
  res.render("ajouter-client.ejs",{city : citiesOfMorocco , message:message ,is_invalid:is_invalid });
});
app.get("/listeClients", async(req, res) => {
let is_invalid = ""
const clients = await getClientsList();
console.log(clients)
  res.render("liste-clients.ejs",{clients : clients, is_invalid  : is_invalid });
});
app.get("/ajouterCommande", async (req, res) => {
  const clients = await getClientsList();
  res.render("ajouter-commande.ejs",{clients : clients});
});
app.get("/listeCommandes", async (req, res) => {
  const orders = await getOrdersList();
    res.render("liste-commandes.ejs",{commandes : orders}); 
  
});
app.get("/reglerCompta", (req, res) => {
  res.render("comptabilite.ejs");
});
app.get("/fiche-compta", async (req, res) => {
  const ficheCompta = await getCompta()
console.log(ficheCompta)
res.render("fiche-compta.ejs",{fichCompta : ficheCompta})
});





//Post Routes
app.post("/ajouterClients", async (req, res) => {
  const name = req.body["name"]
  const phone = req.body["phone"] 
  const city =req.body["city"]
  const adress =req.body["adress"]
  const platforme =req.body["platforme"] 
  try{

    await db.query("INSERT INTO clients(name , phone , city , adress , platforme) VALUES ($1,$2,$3,$4,$5)",
      [name,phone,city,adress,platforme]
    );
    res.redirect("/ajouterClients");
  }catch(err){
    console.log(err)
   /* if(phone.length === 10){
      message = "this phone number already existe"
      is_invalid="is-invalid"
      
    }else{
      message = "Complete the phone number "
      is_invalid="is-invalid"
    }
    res.render("ajouter-client.ejs",{city : citiesOfMorocco , message:message , is_invalid:is_invalid});*/
  }
  
  
});

app.post("/ajouterCommande", async(req, res) => {
  const client = req.body["client"];
  const montant  = req.body["montant"]; 
  const avance  = req.body["avance"];
  const livraison  = req.body["Frais de livraison"]; 
  const rest  = parseInt(req.body["montant"], 10)-parseInt(req.body["avance"],10)+parseInt(req.body["Frais de livraison"],10);
  const nbrArticls =req.body["numberArticls"];
  const trakingNbr =req.body["tracking number"];
  const date = new Date();
  const discription =req.body["discription"];
  
  try{
    await db.query("INSERT INTO orders(nbr_articl , montant , avance , livraison , rest , discription ,traking_nbr , date , client_id) VALUES ($1 , $2 , $3 , $4 ,$5 , $6 , $7 , $8 ,$9)",
      [nbrArticls , montant , avance , livraison , rest , discription , trakingNbr , date , client])
    res.redirect("/ajouterCommande")
  }catch(err){
    console.log(err)
  }
  
});

app.post("/reglerCompta",async  (req, res) => {
  const baridBank = parseInt(req.body["Barid Bank"],10);
  const cihBank = parseInt(req.body["CIH Bank"],10); 
  const chaabiBank = parseInt(req.body["Chaabi Bank"]);
  const cash = parseInt(req.body["Cash"]); 
  const cashBeyou = parseInt(req.body["Cash BEYOU"]);
  const fournisseur = parseInt(req.body["Fournisseur"]);
  const commandeImpaye = parseInt(req.body["Commandes impayées"]);
  const commandeEnLivraison = parseInt(req.body["Commandes en cours de livraison"]);
  const capitalReel = baridBank + cihBank + chaabiBank + cash + cashBeyou + fournisseur;
  const capitalGeneral= capitalReel + commandeImpaye + commandeEnLivraison ;
  const date =  getCurrentDate();
  
try{
await db.query("INSERT INTO compta (barid_bank , cih_bank , chaabi_bank , cash ,cash_beyou ,fournisseur ,commande_impaye ,commande_livraison ,capital_reel ,capital_general ,date) VALUES ($1 ,$2 ,$3 ,$4 ,$5 ,$6 ,$7 ,$8 ,$9 ,$10 ,$11)",
  [baridBank , cihBank , chaabiBank , cash , cashBeyou , fournisseur , commandeImpaye , commandeEnLivraison , capitalReel , capitalGeneral , date]
)
const ficheCompta = await getCompta()
console.log(ficheCompta)
res.render("fiche-compta.ejs",{fichCompta : ficheCompta})
}catch(err){
console.log(err)
}
});

app.post("/listeClients", async (req, res) => {
  let is_invalid =""
  let search = req.body["search"].toUpperCase()
  let clientFound = false
  const clientsList = await getClientsList()
  let searchedClient = [];
  clientsList.forEach(client =>{
    if(client.name.toUpperCase().indexOf(search)>-1){
      searchedClient.push(client)
      clientFound = true
    }
  })
  if(clientFound){
    console.log(searchedClient)
  }else{
    console.log("client not found")
    is_invalid = "is-invalid"
  }
  res.render("liste-clients.ejs",{clients : searchedClient, is_invalid : is_invalid }); 
  
  })

  app.post("/listeCommandes", async (req, res) => {
    let search = req.body["search"].toUpperCase()
    let commandFound = false
    let searchedCommande = [];
    commandesList.forEach(commande =>{
      if(commande.client.toUpperCase().indexOf(search)>-1){
        searchedCommande.push(commande)
        commandFound = true
      }
    })
    if(commandFound){
      console.log(searchedCommande)
    }else{
      console.log("commande not found")
    }
    const orders = await getOrdersList();
    res.render("liste-commandes.ejs",{commandes : orders});    
    })

app.listen(port, () => {
  console.log(`Server running on port: http://localhost:${port}`);
});



function getCurrentDate() {
  let date = new Date();
  
  let year = date.getFullYear();
  let month = (date.getMonth() + 1).toString().padStart(2, '0'); 
  let day = date.getDate().toString().padStart(2, '0'); 

  return `${year}-${month}-${day}`;
}



