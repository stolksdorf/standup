const config = require('./config.json')
const Trello = new (require('trello'))(config.auth.key, config.auth.token);
const clip = require('node-clipboard');

Trello.makeRequest('get', `/1/boards/${config.board_id}`, {
	cards       : 'open',
	card_fields : 'name,idList',
	lists       : 'open',
	list_fields : 'id,name',
})
.then((board)=>{
	const filterByListName = (listNames)=>{
		const result = listNames.map((listName)=>{
			const list = board.lists.find((list)=>list.name == listName);
			return board.cards.filter((card)=>card.idList == list.id);
		})
		return [].concat.apply([], result)
	};
	return {
		today     : filterByListName(config.today_lists),
		yesterday : filterByListName(config.yesterday_lists),
	}
})
.then((tasks)=>{
	return `*Yesterday*
${tasks.yesterday.map((card)=>`- ${card.name}`).join('\n')}

*Today*
${tasks.today.map((card)=>`- ${card.name}`).join('\n')}
`
})
.then((standupMsg)=>{
	console.log(standupMsg);
	clip(standupMsg, ()=>console.log('\nCopied to clipboard!'))
});