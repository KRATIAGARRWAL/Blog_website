import { Toaster, toast} from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";
import Tag from "./tags.component";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";

const PublishForm =()=>{

    let characterLimit=200
    let tagLimit=10;

    let {blog, blog:{banner, title, tags, des, content}  ,setEditorState, setBlog}= useContext(EditorContext)

    let {userAuth : {access_token}}= useContext(UserContext);

    let navigate = useNavigate();

    const handleCloseEvent = () => {
        setEditorState("editor");
    }

    const handleBlogTitleChange = (e)=>{
        let input=e.target;
        setBlog({...blog, title:input.value})
    }

    const handleBlogDesChange =(e)=>{
        let input= e.target;
        setBlog({...blog, des:input.value})
    }

    const handleTitleKeyDown=(e)=>{
        // console.log(e);
        if(e.keyCode==13){//enter key
            e.preventDefault();
        }

    }

    const handleKeyDown = (e)=>{
        if(e.keyCode==13 || e.keyCode==188){
            e.preventDefault();
            let tag=e.target.value;
            if(tags.length < tagLimit ){
                if(!tags.includes(tag) && tag.length){
                    setBlog({...blog, tags: [...tags, tag]})
                }
            }
            else{
                toast.error(`You can add max ${tagLimit}`)
            }
            e.target.value="";

        }
    }

    const publishBlog= (e)=>{
        if(e.target.className.includes("disable")){
            return;
        }
        if(!title.length){
            return toast.error("Please enter title");
        }
        if(!des.length || des.length>characterLimit){
            return toast.error("Please enter description");
        }
        if(!tags.length){
            return toast.error("Please enter tags to help rank");
        }
        let loadingToast = toast.loading("Publishing.....");
        e.target.classList.add('disable')

        let blogObj ={
            title, banner, des, content, tags, draft:false
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN+"/create-blog", blogObj, {
            headers: {
                'Authorization' : `Bearer ${access_token}`
            }
        }).then(()=>{
            e.target.classList.remove('disable')
            toast.dismiss(loadingToast);
            toast.success("Blog Published Successfully");

            setTimeout(()=>{
                navigate("/")
            }, 500)
        })
        .catch(({ response })=>{
            e.target.classList.remove('disable')
            toast.dismiss(loadingToast);
            return toast.error(response.data.error);
        })
    }

    return (
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
                <Toaster/>

                <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] top-[10%]"
                onClick={handleCloseEvent}>
                    <i className="fi fi-br-cross"></i>
                </button>

                <div className="max-w-[550px] center"> 
                    <p className="text-dark-grey mb-1">Preview</p>
                    <div className="w-full aspect-vedio rounded-lg overflow-hidden bg-grey mt-4">
                        <img src={banner}/>
                    </div>

                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">{title}</h1>

                    <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">{des}</p>
                </div>

                <div className="border-grey lg:border-1 lg:pl-8">
                    <p className="text-dark-grey mb-2 mt-9">Blog Title</p>
                    <input type="text" defaultValue={title} className="input-box pl-4 " placeholder="Blog Title" onChange={handleBlogTitleChange}/>

                    <p className="text-dark-grey mb-2 mt-9">Short description</p>

                    <textarea 
                        maxLength={characterLimit}
                        defaultValue={des}
                        className="h-40 resize-none leading-7 input-box pl-4" 
                        onChange={handleBlogDesChange}
                        onKeyDown={handleTitleKeyDown}
                    >

                    </textarea>

                    <p className="mt-1 text-dark-grey text-sm text-right">{characterLimit-des.length} characters left</p>

                    <p className="text-dark-grey mb-2 mt-9">Topics - Helps in searching and ranking your blog </p>

                    <div className="relative input-box pl-2 py-2 pb-4">
                        <input type="text" className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white" placeholder="Topic"
                        onKeyDown={handleKeyDown} />


                        {
                            tags.map((tag,i)=>{
                                return <Tag tag={tag} tagIndex={i} key={i} />
                            })
                        }

                    </div>

                    <p className="mt-1 mb-4 text-dark-grey text-right">{tagLimit - tags.length} Tags left</p>

                    <button className="btn-dark px-8"
                    onClick={publishBlog}
                    >
                         Publish
                    </button>
                    
                </div>

            </section>
        </AnimationWrapper>
    )
   
}
export default PublishForm;