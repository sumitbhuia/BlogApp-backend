import { Context } from "hono";
import { Jwt } from "hono/utils/jwt";
import { signInSchema , signUpSchema } from "../zod/user";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from "@prisma/extension-accelerate";


enum StatusCodes{
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORISED = 401,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

export async function signup(c:Context) {

    
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    


    try {
        const body : {
            username : string ,
            email : string, 
            password : string
        } = await c.req.json();

        

        

        const {username , email , password} = body;

        const parsedUser = signUpSchema.safeParse(body);
       
        // Zod error handling
        if(!parsedUser.success){
            return c.json('Invalid user input', StatusCodes.BAD_REQUEST);
        }
        
        const checkUser = await prisma.user.findFirst({
            where:{
                email
            }
        })
        
        // Check if user already exists
        if(checkUser?.email == email){
            return c.json('User already exists', StatusCodes.BAD_REQUEST);
        }

        const newUser = await prisma.user.create({
            data:{
                username ,
                email,
                password

            }
        })
        const token = await Jwt.sign({userId:newUser.id},c.env.JWT_SECRET);
        
        return c.json({
            msg: 'User created successfully ',
            token : token,
            user : {
                userId : newUser.id,
                username : newUser.username,
                email : newUser.email
            }
            } ,StatusCodes.OK );

    }
    catch(error){
        return c.json(`Error creating user ${error}`, StatusCodes.INTERNAL_SERVER_ERROR);
    }   
}
export async function signin(c:Context) {
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {

        const body : {
            email : string, 
            password  :string} = await c.req.json();

        const parsedUser = signInSchema.safeParse(body);

        //Zod error handling
        if(!parsedUser.success){
            return c.json('Invalid user input', StatusCodes.BAD_REQUEST);
        }
        const {email , password} = body;


        const checkUser = await prisma.user.findFirst({
            where:{
                email,
                password
            } });

        // Checking if user exists
        if(!checkUser){
            return c.json('User not found', StatusCodes.BAD_REQUEST);
        }

        //  This is not required as prisma will throw an error if user not found
        //  Checking credential match
        // if(checkUser.password != password){
        //     c.json('Wrong credentials', StatusCodes.BAD_REQUEST);
        // }


        const token = await Jwt.sign({userId:checkUser?.id},c.env.JWT_SECRET);

        return c.json(
            {
                msg:  'Signed in successfully',
                token : token,
            }, 
            StatusCodes.OK
        );
    } catch (error) {
        return c.json(`Error signing in . ${error}`, StatusCodes.INTERNAL_SERVER_ERROR);       
    }  
}

// Didnt use map here , in both functions . If error arises , use map
export async function getAllUsers(c:Context) {
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try{
        const allUser = await prisma.user.findMany();
        return c.json(allUser , StatusCodes.OK);}


    catch(error){
       return c.json(`Error in fetching all users .${error} `,StatusCodes.INTERNAL_SERVER_ERROR);
    }
}
export async function getUserById(c:Context) { 
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());

        try {
            // Typecasting id to number
            const cid:number  = Number(c.req.param('id'));

            const user = await prisma.user.findFirst({
                where:{
                    id:cid
                }, include:{
                    Post:true
                }
            });

            if(!user){
                return c.json({msg :'User not found'}, StatusCodes.NOT_FOUND);
            }
            return c.json(user);
            
        } catch (error) {
            return c.json(`Error finding user by id . ${error} ` , StatusCodes.NOT_FOUND);
            
        }
}