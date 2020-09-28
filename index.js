const express = require('express')

const session = require('express-session');

const app = express();

let db = {}

function useNotLogin(req, res, next){
	if(!req.session.user)
		next()
}


app.use(session({
    secret: 'mbs',
    resave: true,
    saveUninitialized: true
}));


app.use(express.static('public'))

app.get('/', (req, res) => {
	res.send('test');
})

app.post('/register',useNotLogin, (req, res) => {
	if(db[req.body.id]){
		res.status(500).json({msg:"이미 존재하는 유저 정보"})
	}
	else
		res.status(200).json({msg:"등록 완료"})
})

app.post('/login',useNotLogin, (req, res) => {
	if(db[req.body.id]){
		req.session.user = db[req.body.id];
		req.session.save()
		res.status(200).json({msg:"로그인 성공"})
	}
	else
		res.status(500).json({msg:"존재하지 않는 유저 정보"})
})

app.listen(1000, ()=>{
	console.log('server start')
})
