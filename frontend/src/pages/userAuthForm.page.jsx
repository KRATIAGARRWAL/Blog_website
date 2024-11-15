import InputBox from "../components/input.component"

const UserAuthForm =({type})=>{
    return(
        <section className="h-cover flex items-center justify-center">
            <form action="" className="w-[80%] max-w-[400px]">
                <h1 className="text-4x1 font-gelasio capitalize text-center mb-24">
                    {type=="sign in"? "Welcome back":"Join us today"}

                </h1>
                {
                    type!="sign in"?
                    
                    <InputBox
                    name="fullname"
                    type="text"
                    placeholder="Full Name"
                    icon="fi-rr-user"
                    />
                    
                    
                    
                    :
                    ""

                   
                }
                <InputBox
                name="email"
                type="email"
                placeholder="Email"
                icon="fi-rr-envelope"
                />
                <InputBox
                name="password"
                type="password"
                placeholder="Password"
                icon="fi-rr-key"
                />
                <button className="btn-dark center mt-14" type="submit">
                    {type.replace("-"," ")}
                </button>
                <div className="relative w-full flex items-center gap-2 my-10 opacity-10 uppercase text-black font-bold"></div>
            </form>
        </section>
    )
}

export default UserAuthForm;