const BlogContent=({block})=>{
    let {type, data}=block;
    console.log(data)
    if(type=="paragraph"){
        return <p dangerouslySetInnerHTML={{__html: data.text}}></p>
    }
    else{
        return <p>This sis </p>
    }
}

export default BlogContent;