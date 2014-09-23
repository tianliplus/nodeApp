var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var db = mongoose.createConnection('localhost', 'nodeWeb');
var VotesSchema = require('../models/Votes.js').VotesSchema;
var Vote = db.model('votes', VotesSchema);

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'nodeApp' });
});

router.get('/vote', function(req, res){
	Vote.find({}, 'question', function(error, votes){
		res.json(votes);
	});
});

router.get('/:id', function(req, res){
	var voteId = req.params.id;
	Vote.findById(voteId, '', { lean: true }, function(err, vote){
		if(vote){
			var userVoted = false, userChoice, totalVotes = 0;
			for(c in vote.choices){
				var choice = vote.choices[c];
				for(v in choice.votes){
					var voteItem = choice.votes[v];
					totalVotes++;
					if(voteItem.ip === (req.ip || req.header('x-forwarded-for'))){
						userVoted = true;
						userChoice = { _id: choice._id, text: choice.text };
					}
				}
			}
			vote.userVoted = userVoted;
			vote.userChoice = userChoice;
			vote.totalVotes = totalVotes;
			res.json(vote);
		}else{
			res.json({error: true});
		}
	});
});

router.post('/', function(req, res){
	var reqBody = req.body;
	var choices = reqBody.choices.filter(
		function(v){ return v.text != '';}
	);
	var voteObj = { question: reqBody.question, choices: choices };
	var vote = new Vote(voteObj);
	vote.save(function(err, doc){
		if(err || !doc){
			throw 'Error';
		}else{
			res.json(doc);
		}
	});
});

exports.router = router;
exports.dovote = function(socket){
	socket.on('send:dovote', function(data){
		var ip = socket.handshake.address.address || socket.handshake.headers['x-forwarded-for']	;
		Vote.findById(data.vote_id, function(err, vote){
			var choice = vote.choices.id(data.choice);
			choice.votes.push({ ip : ip });
			vote.save(function(err, doc){
				var theDoc = {
					question : doc.question, 
					_id : doc._id, 
					choices : doc.choices,
					userVoted : false,
					totalVotes : 0
				};
				for(var i = 0, l = doc.choices.length; i < l; i++){
					var choice = doc.choices[i];
					for(var j = 0, jl = choice.votes.length; j < jl; j++){
						var v = choice.votes[j];
						theDoc.totalVotes++;
						theDoc.ip = ip;
						if(v.ip === ip){
							theDoc.userVoted = true;
							theDoc.userChoice = {
								_id : choice._id,
								text : choice.text
							};
						}
					}
				}
				socket.emit('myvote', theDoc);
				socket.broadcast.emit('dovote', theDoc);
			});
		});
	});
};
