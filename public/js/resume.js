let objResumeData = null

function loadResumeOptions(){
    fetch("/api/resume")
    .then(result => {
        return result.json()
    })
    .then(data => {
        if(data.outcome == "success"){
            objResumeData = data.message
            renderJobCheckboxes()
            renderSkillCheckboxes()
            renderCertCheckboxes()
            renderAwardCheckboxes()
        }
    })
}

function renderJobCheckboxes(){
    let divJobs = document.querySelector('#divResumeJobs')
    divJobs.innerHTML = ''
    let arrJobs = objResumeData.jobs
    if(arrJobs.length == 0){
        divJobs.innerHTML = '<p class="text-muted">No jobs added yet.</p>'
        return
    }
    for(let i = 0; i < arrJobs.length; i++){
        let objJob = arrJobs[i]
        divJobs.innerHTML += `
            <div class="form-check">
                <input class="form-check-input chk-job" type="checkbox" value="${objJob.JobID}" id="chkJob_${objJob.JobID}" checked>
                <label class="form-check-label" for="chkJob_${objJob.JobID}">${objJob.Title} at ${objJob.Company}</label>
            </div>
        `
    }
}

function renderSkillCheckboxes(){
    let divSkills = document.querySelector('#divResumeSkills')
    divSkills.innerHTML = ''
    let arrSkills = objResumeData.skills
    if(arrSkills.length == 0){
        divSkills.innerHTML = '<p class="text-muted">No skills added yet.</p>'
        return
    }
    for(let i = 0; i < arrSkills.length; i++){
        let objSkill = arrSkills[i]
        divSkills.innerHTML += `
            <div class="form-check form-check-inline">
                <input class="form-check-input chk-skill" type="checkbox" value="${objSkill.SkillID}" id="chkSkill_${objSkill.SkillID}" checked>
                <label class="form-check-label" for="chkSkill_${objSkill.SkillID}">${objSkill.SkillName}</label>
            </div>
        `
    }
}

function renderCertCheckboxes(){
    let divCerts = document.querySelector('#divResumeCerts')
    divCerts.innerHTML = ''
    let arrCerts = objResumeData.certifications
    if(arrCerts.length == 0){
        divCerts.innerHTML = '<p class="text-muted">No certifications added yet.</p>'
        return
    }
    for(let i = 0; i < arrCerts.length; i++){
        let objCert = arrCerts[i]
        divCerts.innerHTML += `
            <div class="form-check">
                <input class="form-check-input chk-cert" type="checkbox" value="${objCert.CertID}" id="chkCert_${objCert.CertID}" checked>
                <label class="form-check-label" for="chkCert_${objCert.CertID}">${objCert.CertName}</label>
            </div>
        `
    }
}

function renderAwardCheckboxes(){
    let divAwards = document.querySelector('#divResumeAwards')
    divAwards.innerHTML = ''
    let arrAwards = objResumeData.awards
    if(arrAwards.length == 0){
        divAwards.innerHTML = '<p class="text-muted">No awards added yet.</p>'
        return
    }
    for(let i = 0; i < arrAwards.length; i++){
        let objAward = arrAwards[i]
        divAwards.innerHTML += `
            <div class="form-check">
                <input class="form-check-input chk-award" type="checkbox" value="${objAward.AwardID}" id="chkAward_${objAward.AwardID}" checked>
                <label class="form-check-label" for="chkAward_${objAward.AwardID}">${objAward.AwardName}</label>
            </div>
        `
    }
}

document.querySelector('#btnGenerateResume').addEventListener('click',function(){
    let arrSelectedJobs = []
    document.querySelectorAll('.chk-job:checked').forEach(function(chk){
        arrSelectedJobs.push(chk.value)
    })
    let arrSelectedSkills = []
    document.querySelectorAll('.chk-skill:checked').forEach(function(chk){
        arrSelectedSkills.push(chk.value)
    })
    let arrSelectedCerts = []
    document.querySelectorAll('.chk-cert:checked').forEach(function(chk){
        arrSelectedCerts.push(chk.value)
    })
    let arrSelectedAwards = []
    document.querySelectorAll('.chk-award:checked').forEach(function(chk){
        arrSelectedAwards.push(chk.value)
    })

    let strHTML = ''
    let objUser = objResumeData.user.length > 0 ? objResumeData.user[0] : null

    if(objUser){
        strHTML += `<h1>${objUser.FirstName} ${objUser.LastName}</h1>`
        let arrContact = []
        if(objUser.City && objUser.State) arrContact.push(objUser.City + ', ' + objUser.State)
        if(objUser.Phone) arrContact.push(objUser.Phone)
        if(objUser.Email) arrContact.push(objUser.Email)
        if(objUser.LinkedIn) arrContact.push(objUser.LinkedIn)
        strHTML += `<div class="resume-contact">${arrContact.join(' | ')}</div>`

        if(objUser.Summary && objUser.Summary.length > 0){
            strHTML += '<h2>Professional Summary</h2>'
            strHTML += `<p>${objUser.Summary}</p>`
        }
    }

    let arrFilteredJobs = objResumeData.jobs.filter(function(job){
        return arrSelectedJobs.indexOf(job.JobID) != -1
    })
    if(arrFilteredJobs.length > 0){
        strHTML += '<h2>Experience</h2>'
        for(let i = 0; i < arrFilteredJobs.length; i++){
            let objJob = arrFilteredJobs[i]
            let strEnd = objJob.Current ? "Present" : (objJob.EndDate || '')
            strHTML += `<div class="job-header"><h3>${objJob.Title} - ${objJob.Company}</h3><span class="job-date">${objJob.StartDate} - ${strEnd}</span></div>`
            let arrDetails = objResumeData.jobdetails.filter(function(detail){
                return detail.JobID == objJob.JobID
            })
            if(arrDetails.length > 0){
                strHTML += '<ul>'
                for(let j = 0; j < arrDetails.length; j++){
                    strHTML += `<li>${arrDetails[j].Description}</li>`
                }
                strHTML += '</ul>'
            }
        }
    }

    let arrFilteredSkills = objResumeData.skills.filter(function(skill){
        return arrSelectedSkills.indexOf(skill.SkillID) != -1
    })
    if(arrFilteredSkills.length > 0){
        strHTML += '<h2>Skills</h2>'
        let objCategories = {}
        for(let i = 0; i < arrFilteredSkills.length; i++){
            let strCat = arrFilteredSkills[i].Category || 'General'
            if(!objCategories[strCat]) objCategories[strCat] = []
            objCategories[strCat].push(arrFilteredSkills[i].SkillName)
        }
        for(let strCat in objCategories){
            strHTML += `<div class="skill-category"><strong>${strCat}:</strong> <span>${objCategories[strCat].join(', ')}</span></div>`
        }
    }

    let arrFilteredCerts = objResumeData.certifications.filter(function(cert){
        return arrSelectedCerts.indexOf(cert.CertID) != -1
    })
    if(arrFilteredCerts.length > 0){
        strHTML += '<h2>Certifications</h2>'
        strHTML += '<ul>'
        for(let i = 0; i < arrFilteredCerts.length; i++){
            let objCert = arrFilteredCerts[i]
            let strCert = objCert.CertName
            if(objCert.Issuer) strCert += ' - ' + objCert.Issuer
            if(objCert.DateEarned) strCert += ' (' + objCert.DateEarned + ')'
            strHTML += `<li>${strCert}</li>`
        }
        strHTML += '</ul>'
    }

    let arrFilteredAwards = objResumeData.awards.filter(function(award){
        return arrSelectedAwards.indexOf(award.AwardID) != -1
    })
    if(arrFilteredAwards.length > 0){
        strHTML += '<h2>Awards</h2>'
        strHTML += '<ul>'
        for(let i = 0; i < arrFilteredAwards.length; i++){
            let objAward = arrFilteredAwards[i]
            let strAward = objAward.AwardName
            if(objAward.Issuer) strAward += ' - ' + objAward.Issuer
            if(objAward.DateEarned) strAward += ' (' + objAward.DateEarned + ')'
            strHTML += `<li>${strAward}</li>`
        }
        strHTML += '</ul>'
    }

    document.querySelector('#divResumeContent').innerHTML = strHTML
    document.querySelector('#divResumePreview').classList.remove('d-none')
})

document.querySelector('#btnPrintResume').addEventListener('click',function(){
    window.print()
})
