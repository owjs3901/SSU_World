const express = require('express')

const session = require('express-session');
const FileStore = require('session-file-store')(session); // 1


const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: 'public/profile', limits: { fileSize: 5 * 1024 * 1024 } });

const app = express();

/**
 * 유저 데이터
 */
/*
"test@test.com":{
	"id":"test@test.com",
	"name":"testName",
	"birth":"2020-11-25",
	"pw":"test",
	"message":"testMSG",
	"today":0,
	"total":0,
	"comments":[]
}
*/


let db = JSON.parse(fs.readFileSync('db.json', 'utf-8'))

function saveDB() {
	fs.writeFileSync('db.json', JSON.stringify(db), 'utf-8')
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
	saveUninitialized: true,
	store: new FileStore()
}));


app.use(express.static('public'))

app.get('/', (req, res) => {
	res.redirect('/profilebox.html')
})

/**
 * 접속된 유저 정보 확인
 */
app.get('/api/user', (req, res) => {
	if (req.session.user)
		res.status(200).json(db[req.session.user.id])
	else
		res.status(400).end()
})

/**
 * 중복된 아이디인가?
 */
app.post('/api/overlap', (req, res) => {
	console.log(req.body)
	res.status(200).json({
		res: Boolean(db[req.body.id])
	})
})

/**
 * comment list
 */
app.get('/api/comments/:id', (req, res) => {
	if (db[req.params.id])
		res.status(200).json({
			res: db[req.params.id].comments
		})
	else
		res.status(400).end()
})

/**
 * 남의 데이터 확인
 * ex) /api/user/test@test.com
 */
app.get('/api/user/:id', (req, res) => {
	if (db[req.params.id])
		res.status(200).json(db[req.params.id])
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
			id: db[data].id,
			name: db[data].name,
			message: db[data].message,
			total: db[data].total,
			today: db[data].today,
		})

	res.status(200).json(list)
})


app.get('/api/userList', (req, res) => {
	const list = []

	for (const data in db)
		list.push({
			id: db[data].id,
			name: db[data].name,
			message: db[data].message,
			total: db[data].total,
			today: db[data].today,
			img: db[data].img,
		})

	res.status(200).json({ res: list })
})

app.get('/api/isLogin', (req, res) => {
	res.json({
		res: Boolean(req.session.user)
	})
})

/**
 * 댓글 삭제
 * /api/comment/유저아이디/코멘트 아이디
 */
app.delete('/api/comment/:id/:cid', (req, res) => {
	try {
		if (db[req.params.id].comments[req.params.cid].pw == req.body.pw)
			db[req.params.id].comments.splice(req.params.cid, 1)
		res.status(200).json({
			res: true
		})
	}
	catch (e) {
		res.status(200).json({
			res: false
		})
	}
})
/**
 * 댓글 생성
 */
app.post('/api/comment/:id', (req, res) => {
	try {
		db[req.params.id].comments.push({
			con: req.body.con,
			pw: req.body.pw
		})
	}
	catch (e) {
	}
	res.redirect('/youpage.html?id=' + req.params.id)
})

/**
 * 투데이 랭킹
 */
app.get('/api/today-rank', (req, res) => {

	const list = []

	for (const data in db)
		list.push(db[data])

	list.sort(function (a, b) {
		return b.today - a.today;
	});

	res.json({
		res: list.slice(0, 3)
	})
})

/**
 * 유저 삭제
 */
app.delete('/api/user/:id', (req, res) => {
	if(db[req.params.id]) {
		delete db[req.params.id]

		res.status(200).json({
			res: true
		})
	}
	else
		res.status(400).json({
			res: false
		})
})

/**
 * 투데이 상승
 */
app.get('/api/today/:id', (req, res) => {
	if(db[req.params.id]) {
		db[req.params.id].today++;
		db[req.params.id].total++;
		saveDB();
		res.status(200).json({
			res: true
		})
	}
	else
		res.status(400).json({
			res: false
		})
})


app.post('/register', useNotLogin, (req, res) => {
	const { id, pw, name, birth } = req.body;

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
			img: 'img/profile.jpg',
			comments: []
		};
		saveDB()
		res.redirect('/login.html')
	}
})

app.get('/logout', (req, res) => {
	req.session.user = undefined
	req.session.save()

	saveDB()
	res.redirect('/profilebox.html')
})

app.post('/profile', upload.single('img'), (req, res) => {
	const { name, msg } = req.body;
	const id = req.session.user.id;

	db[id].name = name;
	db[id].message = msg;

	if (req.file)
		db[id].img = 'profile/' + req.file.filename;

	req.session.user = db[id]
	req.session.save()

	saveDB()
	res.redirect('/')
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
