/* If you're feeling fancy you can add interactivity 
    to your site with Javascript */

(function() {
  // prints "hi" in the browser's dev tools console
  console.log('hi');
  
  const form = document.forms[0]; //Full form for JSON input
  const textarea = document.getElementById("inputJSON") //Input box for JSON

  // Suppress any dragover events that interfere with drop
  textarea.ondragover = e => {
      e.preventDefault();
    };
  
  // On drop, read file as text and display in textarea
  textarea.ondrop = function(e) {
    e.preventDefault();
    let files = e.dataTransfer.files;
    let reader = new FileReader();
    reader.onload = e => {
      this.value = e.target.result;
    }
    for (let i=0;i<files.length;i++) {
      reader.readAsText(files[i]);
    }
  };
  
  // listen for the form to be submitted and add a new dream when it is
  form.onsubmit = function(event) {
    // stop our form submission from refreshing the page
    event.preventDefault();
    
    let data = textarea.value;
    let json = JSON.parse(data);
    let connections = json.data.attributes.connections;
    let included = json.included;
    let primary_people = json.data.attributes.primary_people;
    let edgeType;
    if (json.data.id === 'all_groups') { 
      edgeType = 'all';
      let nodesArray = buildGroupNodes(included);
      createDownloadLink(nodesArray, "node");
    } else { edgeType = 'one'; };
    let edgesArray = buildEdges(connections, included, edgeType);
    createDownloadLink(edgesArray, "edge");
    if (json.data.id.length < 8) {
      let nodesArray = buildPeopleNodes(included, primary_people);
      createDownloadLink(nodesArray, "node");
    };
  };
  
  const buildEdges = (connections, included, edgeType) => {
    let connectionsArray = [];
    if (edgeType === 'one') {
      connectionsArray.push(['Source ID', 'Target ID', 'Source Name', 'Target Name', 'Altered', 'Start Year Type', 'Start Year', 'End Year Type', 'End Year']);
    } else if (edgeType === 'all') { connectionsArray.push(['Source ID', 'Target ID', 'Source Name', 'Target Name', 'Weight']); };
    connections.forEach( c => {
      if (c.attributes.source.id) {
        var source = c.attributes.source.id;
        var source_name = c.attributes.source.attributes.name;
        var target = c.attributes.target.id;
        var target_name = c.attributes.target.attributes.name;
      } else {
        source = c.attributes.source;
        target = c.attributes.target;
        included.forEach( i => {
          if (Number(i.id) === Number(source)) {
            source_name = i.attributes.name;
          }
          
          if (Number(i.id) === Number(target)) {
            target_name = i.attributes.name;
          }
        });
      }
      let connection = [source, target, source_name, target_name, c.attributes.altered, c.attributes.start_year_type, c.attributes.start_year, c.attributes.end_year_type, c.attributes.end_year];
      if (edgeType === 'all') { connection = [source, target, source_name, target_name, c.attributes.weight]; };
      connectionsArray.push(connection);
    });
    // connectionsArray = connectionsArray.map( c => c.toString() );
    connectionsArray = connectionsArray.map( c => '"'+c.join('","')+'"' );
    return connectionsArray;
  };
  
    
  const buildPeopleNodes = (included, primary_people) => {
    let includedArray = [['id', 'name', 'birth_year_type', 'birth_year', 'death_year_type', 'death_year', 'gender', 'odnb_id', 'historical_significance', 'group_member']];
    included.forEach( i => {
      let group_member;
      if (primary_people.indexOf(String(i.id)) !== -1) {
        group_member = true;
      } else { group_member = false; };
      let person = [i.id, i.attributes.name, i.attributes.birth_year_type, i.attributes.birth_year, i.attributes.death_year_type, i.attributes.death_year, i.attributes.gender, i.attributes.odnb_id, i.attributes.historical_significance, group_member];
      person = person.map( p => String(p) );
      includedArray.push(person);
    });
    includedArray = includedArray.map( i => '"'+i.join('","')+'"' );
    return includedArray;
  };
  
  const buildGroupNodes = (included) => {
    let includedArray = [['id', 'name', 'start_year_type', 'start_year', 'end_year_type', 'end_year', 'number_of_members', 'description']];
    included.forEach( i => {
      let group_member;
      let person = [i.id, i.attributes.name, i.attributes.start_year_type, i.attributes.start_year, i.attributes.end_year_type, i.attributes.end_year, i.attributes.degree, i.attributes.description.replace(/"/g, "'")];
      person = person.map( p => String(p) );
      includedArray.push(person);
    });
    includedArray = includedArray.map( i => '"'+i.join('","')+'"' );
    return includedArray;
  };
  
  const createDownloadLink = (csvArray, fileType) => {
    let csvContent = csvArray.join("\r\n");
    csvContent = "data:text/csv;charset=utf-8," + csvContent;
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sdfb_"+fileType+"list.csv");
    let button = document.createElement("button");
    button.innerHTML= "Click Here to download "+fileType+" list";
    link.appendChild(button);
    document.body.appendChild(link);
  };
  
})();