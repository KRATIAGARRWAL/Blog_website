// import axios from "axios";

// export const uploadImage= async (img)=>{
//     let imgUrl =null;
//     await axios.get(import.meta.env.VITE_SERVER_DOMAIN+ "/get-upload-url")
//     .then( async ({data:{uploadURL} })=> {
//         await axios({
//             method: 'PUT',
//             url: uploadURL,
//             headers : {'Content-Type' : 'image/jpeg'},
//             data:img
//         })
//         .then(()=>{
//             imgUrl= uploadURL.split("?")[0]
//         })
//         .catch((err)=>{
//             console.log(err+" in the catch  2");
//         })
//     })
//     .catch((err)=>{
//         console.log(err+" in the cathc block 1");
//     })
//     return imgUrl;
// }



import axios from "axios";

export const uploadImage = async (img) => {
    let imgUrl = null;
    
    try {
        const { data: { uploadURL } } = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url");
        await axios.put(uploadURL, img, {
            headers: { 'Content-Type': img.type || 'image/jpeg' }
        });

        
        imgUrl = uploadURL.split("?")[0];
    } catch (error) {
        console.error("Error uploading image:", error);
    }

    return imgUrl;
};