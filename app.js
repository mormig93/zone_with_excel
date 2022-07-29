const axios = require("axios").default;
const reader = require('xlsx')
let file_name = null
let time_per_post = null

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});


console.log('ingresar el nombre del archivo en el directorio data del proyecto\n')
readline.question('nombre del archivo excel > ', line => {
    file_name = line
    readline.question('ingresar el tiempo en segundos...!\ntiempo entre cada post > ', line_2 => {
        if (isNaN(line_2)) {
            console.log(`${line_2} no es un numero`);
            readline.close();
        } else {
            time_per_post = parseInt(line_2) * 1000
            return time_per_post
            //readline.close();
        }
    })
    return file_name
    //readline.close();
});

// Reading our data file
const file = reader.readFile(file_name)

//data temporal mientras se almacena 
const temporal_data = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[0]])

//for store csv data
const data_from_excel = [];

//almacenamiento de la data en un array
temporal_data.forEach((row) => { data_from_excel.push(row) })

//main function for execution code
function Main() {
    let position = 0
    const processID = setInterval(() => {
        if (data_from_excel[position] === undefined) {
            clearInterval(processID)
        } else {
            shareToSocial(data_from_excel[position], position)
            position++
        }
    }, time_per_post)
}

//for telegram bot api
const tg_token = '5212294496:AAGcQF613aFdOXt-RJWi42ijsxSXBPtahdM'
const tg_chatId = '@synctest'
const post_type = ['sendMessage', 'sendPhoto']
const url = `https://api.telegram.org/bot${tg_token}/`
const options = {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Telegram Bot SDK - (https://github.com/irazasyed/telegram-bot-sdk)'
    },
    data: {
        chat_id: tg_chatId,
        parse_mode: 'HTML',
    }
}

//configure and formating data for structure of telegram bot api
function shareToSocial(item, position) {
    let pre_title = (item['prodname']).toUpperCase()
    let img = item['image-src']
    let link = item['Aff Link']
    let pre_code = item['Promocode']
    let pre_discount = item['Discount']

    //formating title, title only use limit character for to post
    let limit_char = 30
    let title = pre_title.slice(0, limit_char) + (pre_title.length > limit_char ? "..." : "")
    let promocode = `\n<b>PROMO CODE</b>: <code>${pre_code}</code>\n`
    let discount = pre_discount + '% ON'

    if (link) {
        //message formating for post
        let message = `
        📢 SAVE OFF${pre_discount ? discount : 'ON'} ${title}${pre_code ? promocode : '\n'}👇👇👇\n<a href="${link}">Clic Here</a>
        `

        img ? sendPost(post_type[1], message, img, position) : sendPost(post_type[0], message, img, position)
    } else {
        sendPost(post_type[0], 'link no exist', img, position)
    }
}

function sendPost(type_post, text, img, position) {
    let option = options

    //add data configure url for send text
    if (type_post === post_type[0]) {
        option.url = url + type_post
        option.data.text = text
    }

    //add data configure url for send image
    if (type_post === post_type[1]) {
        option.url = url + type_post
        option.data.photo = img
        option.data.caption = text
    }

    //http request for send info to tg with url configured
    axios(option)
        .then((res) => {
            console.log((position + 1) + ': true');
        }).catch((error) => {
            console.log((position + 1) + ': error');
        });
}

//export function
module.exports = { Main }