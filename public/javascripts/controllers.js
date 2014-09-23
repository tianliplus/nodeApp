function VoteListControl($scope, Vote){
	$scope.votes = Vote.query();
}

function VoteItemControl($scope, $routeParams, socket, Vote){
	$scope.vote = Vote.get({voteId: $routeParams.voteId});
	socket.on('myvote', function(data){
		console.dir(data);
		if(data._id === $routeParams.voteId){
			$scope.vote = data;
		}
	});
	socket.on('dovote', function(data){
		console.dir(data);
		if(data._id === $routeParams.voteId){
			$scope.vote.choices = data.choices;
			$scope.vote.totalVotes = data.totalVotes;
		}
	});
	$scope.dovote = function(){
		var voteId = $scope.vote._id;
		var choiceId = $scope.vote.userVote;
		if(choiceId){
			var voteObj = {
				vote_id : voteId,
				choice : choiceId
			};
			socket.emit('send:dovote', voteObj);
		}else{
			alert('必须选择一项才能投票哦');
		}
	};
}

function VoteNewControl($scope, $location, Vote){
	$scope.vote = {
		question: '',
		choices: [{ text: ''}, { text: ''}, { text: ''}]
	};
	$scope.addChoice = function(){
		$scope.vote.choices.push({ text : ''});
	};
	$scope.createVote = function(){
		var vote = $scope.vote;
		if(vote.question.length > 0){
			var choiceCount = 0;
			for(var i = 0, l = vote.choices.length; i < l; i++){
				var choice = vote.choices[i];
				if(choice.text.length > 0){
					choiceCount++;
				}
			}
			if(choiceCount > 1){
				var newVote = new Vote(vote);
				newVote.$save(function(v, resv){
					if(!v.error){
						$location.path('vote');
					}else{
						alert('无法创建新投票');
					}
				});
			}else{
				alert('要有两个选项以上才行哦');
			}
		}else{
			alert('先输入问题才能创建投票哦')
		}
	};
}
