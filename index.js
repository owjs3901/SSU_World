const express = require('express')

const session = require('express-session');

const cors = require('cors');

const app = express();

/**
 * 유저 데이터
 */
/*
user : {
	pw:'pw' //비밀번호
}
*/


let db = {
	'test@test.com': {
		id: 'test@test.com',
		pw: 'test',
		name: 'testName',
		today: 0,
		birth: 0,
		total: 0,
		msg: 'testMsg',
		comments:[]
	}
}

function useNotLogin(req, res, next) {
	if (!req.session.user)
		next()
}

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(cors())
app.use(session({
	secret: 'mbs',
	resave: true,
	saveUninitialized: true
}));


app.use(express.static('public'))

app.get('/', (req, res) => {
	res.redirect('/profilebox.html')
})
// fetch('/api/user')
// .then(v=>{
// 	if(v.status == 200)
// 		return v.json()
// })
// .then(v=>{
// 	if (v) {
// 		v.name
// 	}
// 	else
// 		console.log()
// })

/**
 * 접속된 유저 정보 확인
 */
app.get('/api/user', (req, res) => {
	if (req.session.user)
		res.status(200).json(req.session.user)
	else
		res.status(400).end()
})

/**
 * 중복된 아이디인가?
 */
app.post('/api/overlap', (req, res) => {
	console.log(req.body)
	res.status(200).json({
		res : Boolean(db[req.body.id])
	})
})

/**
 * comment list
 */
app.post('/api/comments', (req, res) => {
	if (db[req.body.id])
		res.status(200).json({
			res : db[req.body.id].comments
		})
	else
		res.status(400).end()
})

/**
 * 
 */
app.get('/api/user/:id', (req, res) => {
	if (db[req.session.id])
		res.status(200).json(db[req.session.id])
	else
		res.status(400).end()
})

/**
 * 프로필 박스 리스트(랭킹)
 */
app.get('/api/profile_box', (req, res) => {
	const list = []

	for (const data in db)
		list.push({
			id:db[data].id,
			name:db[data].name,
			msg:db[data].msg,
			total:db[data].total,
			today:db[data].today,
		})

	res.status(200).json(list)
})


app.get('/api/userList', (req, res) => {
	const list = []

	for (const data in db)
		list.push({
			id:db[data].id,
			name:db[data].name,
			msg:db[data].msg,
			total:db[data].total,
			today:db[data].today,
		})

	res.status(200).json({res : list})
})

app.get('/isLogin', (req, res) => {
	res.json({
		res: Boolean(req.body.user)
	})
})


app.post('/register', useNotLogin, (req, res) => {
	const {id, pw, name, birth} = req.body;

	if (db[id]) {
		res.redirect('/login.html')
	}
	else {
		db[id] = {
			id,
			name,
			birth,
			pw,
			message: '',
			today: 0,
			total: 0,
			comments:[]
		};

		console.log(db[id])
		res.redirect('/login.html')
	}
})

app.post('/profile', useNotLogin, (req, res) => {
	const {id, pw, name, birth} = req.body;

	if (db[id]) {
		res.redirect('/login.html')
	}
	else {
		db[id] = {
			id,
			name,
			birth,
			pw,
			message: '',
			today: 0,
			total: 0,
			comments:[]
		};

		console.log(db[id])
		res.redirect('/login.html')
	}
})

app.post('/login', useNotLogin, (req, res) => {
	const id = req.body.id
	const pw = req.body.pw

	if (db[id] && db[id].pw === pw) {
		req.session.user = db[id];
		req.session.save()
		res.redirect('/profilebox.html')
	}
	else
		res.redirect('/login.html')
})

app.get('*', (req, res) => {
	res.redirect('/profilebox.html')
	// res.send("{get} user - 유저 정보 조회<br>{get} isLogin - 로그인 했는가<br>{post} register - 회원가입")
})

app.listen(80, () => {
	console.log('server start!')
})
