function loadSkills(){
    fetch("/api/skills")
    .then(result => {
        return result.json()
    })
    .then(data => {
        let divSkills = document.querySelector('#divSkills')
        divSkills.innerHTML = ''
        if(data.outcome == "success"){
            let arrSkills = data.message
            if(arrSkills.length > 0){
                let strHTML = '<div class="card"><div class="card-body"><table class="table table-sm mb-0"><thead><tr><th>Category</th><th>Skill</th><th></th></tr></thead><tbody>'
                for(let i = 0; i < arrSkills.length; i++){
                    let objSkill = arrSkills[i]
                    strHTML += `<tr>
                        <td>${objSkill.Category || ''}</td>
                        <td>${objSkill.SkillName}</td>
                        <td><button class="btn btn-outline-danger btn-sm" onclick="deleteSkill('${objSkill.SkillID}')" aria-label="Delete ${objSkill.SkillName}">X</button></td>
                    </tr>`
                }
                strHTML += '</tbody></table></div></div>'
                divSkills.innerHTML = strHTML
            }
        }
    })
}

document.querySelector('#btnAddSkill').addEventListener('click',function(){
    let strCategory = document.querySelector('#txtSkillCategory').value.trim()
    let strSkillName = document.querySelector('#txtSkillName').value.trim()

    if(strSkillName.length < 1){
        Swal.fire({title:"Oh no!",html:"<p>You must enter a <b>Skill Name</b></p>",icon:"error"})
        return
    }

    fetch("/api/skills",{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({category:strCategory,skillname:strSkillName})
    })
    .then(result => {
        return result.json()
    })
    .then(data => {
        if(data.outcome == "success"){
            Swal.fire({title:"Skill Added!",icon:"success",timer:1500})
            document.querySelector('#txtSkillCategory').value = ''
            document.querySelector('#txtSkillName').value = ''
            loadSkills()
        } else {
            Swal.fire({title:"Error",text:data.message,icon:"error"})
        }
    })
})

function deleteSkill(strSkillID){
    fetch("/api/skills/" + strSkillID,{method:'DELETE'})
    .then(result => {
        return result.json()
    })
    .then(data => {
        if(data.outcome == "success"){
            loadSkills()
        }
    })
}
