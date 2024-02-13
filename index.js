

const { authorize } = require('./authAPI'); // Importa a função authorize de authAPI.js
const { google } = require('googleapis'); //  Importa a variável google

async function main(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '17_T7uNlg-SFX_DlM9awEcHqKwuZChTZGr187SnV6D-8';
    const range = 'engenharia_de_software!A1:H27';
  
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    const rows = res.data.values;
    const updates = [];
   
        for (let i = 3; i < rows.length; i++) {
            
            const row = rows[i];
            const maxAbsences = 60*0.25;  
            const absences = parseFloat(row[2]);

            // Converte os valores para float e Calcula a média das notas das colunas (D + E + F)
            const p1 = parseFloat(row[3])/10;
            const p2 = parseFloat(row[4])/10;
            const p3 = parseFloat(row[5])/10;
            const average = (p1 + p2 + p3) / 3;

            // Verifica se a média está acima de 7 ou abaixo de 5
            let situation = '';
            if (absences > maxAbsences) {
                situation = 'Reprovado por Falta';
            } else if (average < 5) {
                situation = 'Reprovado por Nota';
            } else if (average < 7) {
                situation = 'Exame Final';
            } else {
                situation = 'Aprovado';
            }

            // Adiciona a atualização coluna G (Situação)
            updates.push({
            range: `engenharia_de_software!G${i+1}`, 
            values: [[situation]],
            })

            // Adiciona a atualização coluna H (naf)
            if (situation === 'Exame Final') {
                const naf = Math.ceil(10 - average);
                updates.push({
                    range: `engenharia_de_software!H${i+1}`, 
                    values: [[naf]],
                });
            } else {
                updates.push({
                    range: `engenharia_de_software!H${i+1}`, 
                    values: [[0]],
                });
            }
        }
  

        // Executa as atualizações
        if (updates.length > 0) {
            await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId,
            resource: {
            data: updates,
            valueInputOption: 'RAW',},
            });
            console.log('Atualizações realizadas com sucesso.');
        } else {
            console.log('Nenhuma atualização necessária.');
        }
    
}
  
authorize()
.then(main)
    