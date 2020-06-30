import router from './util/router.coffee'

appComponent ='''<div>
<h2>Hello World! I'm alive!</h2>
<div id="router-outlet">
</div>
</div>
''';

app = document.getElementById('app')
app.innerHTML=appComponent

router()