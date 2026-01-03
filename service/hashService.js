const fs=require("fs");

const crypto =require("crypto");

async function hashFiles(filepaths,type){
    const hash=crypto.createHash("sha256");

     hash.update(type);

    for(const filePath of filepaths){
        await new Promise((resolve,reject)=>{
            const stream=fs.createReadStream(filePath);
            stream.on("data", chunk => hash.update(chunk));
            stream.on("end", resolve);
            stream.on("error", reject);
        });
    }

    return hash.digest("hex");
}

module.exports= hashFiles;