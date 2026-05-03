// handles navigation between sections
document.querySelectorAll('[data-section]').forEach(function(link){
    link.addEventListener('click',function(e){
        e.preventDefault()
        let strSection = this.getAttribute('data-section')
        document.querySelectorAll('.app-section').forEach(function(section){
            section.classList.add('d-none')
        })
        document.querySelector('#' + strSection).classList.remove('d-none')
        document.querySelectorAll('.nav-link').forEach(function(nav){
            nav.classList.remove('active')
        })
        this.classList.add('active')

        if(strSection == 'sectionJobs') loadJobs()
        if(strSection == 'sectionSkills') loadSkills()
        if(strSection == 'sectionCerts') loadCerts()
        if(strSection == 'sectionAwards') loadAwards()
        if(strSection == 'sectionResume') loadResumeOptions()
        if(strSection == 'sectionProfile') loadProfile()
        if(strSection == 'sectionSettings') loadSettings()
    })
})

// shows credits popup with libraries used
document.querySelector('#btnCredits').addEventListener('click',function(e){
    e.preventDefault()
    Swal.fire({
        title:"Resume Crafter",
        html:"<p>Built with the following libraries:</p>" +
            "<p><b>Bootstrap 5.3</b> - UI Framework<br>" +
            "<b>SweetAlert2</b> - Popup Notifications<br>" +
            "<b>Express.js</b> - Web Server<br>" +
            "<b>SQLite3</b> - Database<br>" +
            "<b>UUID</b> - Unique ID Generation<br>" +
            "<b>Google Gemini API</b> - AI Suggestions</p>" +
            "<p>Thank you to the developers of these libraries.</p>",
        icon:"info"
    })
})

// loads profile on initial page load
loadProfile()
