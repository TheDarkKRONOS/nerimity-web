let initialized = false;


const initialize = (accessToken: string) => new Promise<void>(res => {
  const start = async () => {
    await gapi.client.init({
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      clientId: '833085928210-2ksk1asgbmqvsg6jb3es4asnmug2a4iu.apps.googleusercontent.com',
    })

    gapi.client.setToken({access_token: accessToken})
    initialized = true;
    res();
  }
  gapi.load('client', start);
})


let nerimityUploadsFolder: gapi.client.drive.File | undefined;

export const getOrCreateUploadsFolder = async (accessToken: string) => {
  if (nerimityUploadsFolder) return nerimityUploadsFolder;
  if (!initialized) await initialize(accessToken);
  const res = await gapi.client.drive.files.list({
    q: "name = 'nerimity_uploads' and mimeType = 'application/vnd.google-apps.folder'",
    fields: "files(id)"
  })
  const folder = res.result.files?.[0];
  if (folder) {
    nerimityUploadsFolder = folder;
    return nerimityUploadsFolder;
  }
  
  const newFolder = await gapi.client.drive.files.create({
    resource: {
      name: "nerimity_uploads",
      mimeType: "application/vnd.google-apps.folder"
    },
    fields: "id"
  });
  nerimityUploadsFolder = newFolder.result;
  return nerimityUploadsFolder;
}


// https://stackoverflow.com/questions/53839499/google-drive-api-and-file-uploads-from-the-browser
export const uploadFile = async (file: File, accessToken: string) => {
  if (!initialized) await initialize(accessToken);
  gapi.client.setToken({access_token: accessToken})
  const folder = await getOrCreateUploadsFolder(accessToken);
  const metadata = {
    'name': file.name,
    'mimeType': file.type,
    parents: [folder.id!],
  };


  var form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
  form.append('file', file);
  
  var xhr = new XMLHttpRequest();
  xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,kind');
  xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
  xhr.responseType = 'json';

  return new Promise((resolve, reject) => {
    xhr.onload = async  () => {

      console.log(xhr.response);
      if (xhr.status === 0) {
        return reject({message: "Could not connect to server."})
      }
      if (xhr.status !== 200) {
        nerimityUploadsFolder = undefined;
        return reject(xhr.response);
      }
        const id = xhr.response.id;
  
        const body = {
          value: "default",
          type: "anyone",
          role: "reader"
        };
  
        
        await gapi.client.drive.permissions
        .create({
          fileId: id,
          resource: body
        })
        
            await gapi.client.drive.files.get({
              fileId: id,
              fields: '*'
            }).then(console.log)
        resolve(xhr.response);
  
    };
    xhr.send(form);
  })




}