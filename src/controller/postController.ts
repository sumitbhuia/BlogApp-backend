import { Context } from "hono";

import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from "@prisma/extension-accelerate";


enum StatusCodes{
    OK = 200,
    BAD_REQUEST = 400,
    UNAUTHORISED = 401,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
}

//Didnt use map, if error arises use map
export async function getAllPosts(c:Context) {
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());


    try {
        const allPost = await prisma.post.findMany({
            include:{
                Tag: true,
                User:true
            }
        });
        return c.json(allPost,StatusCodes.OK);
        
    } catch (error) {
        return c.json({error : `Error getting all posts.${error}`},StatusCodes.INTERNAL_SERVER_ERROR)
        
    }
}
//Didnt use map, if error arises use map
export async function getUserPosts(c:Context) {

    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());


    try {

        const usrPosts = await prisma.post.findMany({
            where:{
                userId : c.get(`userId`).userId
            }
        })

        if(usrPosts.length === 0){
            return c.json({msg : 'No posts found'},StatusCodes.NOT_FOUND);
        }

        return c.json(usrPosts,StatusCodes.OK);

        
    } catch (error) {
        return c.json({error : `Error getting user posts.${error}`},StatusCodes.INTERNAL_SERVER_ERROR)
        
    }
}

export async function createPost(c:Context) {

    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());


    try {
        const body : {
            title : string,
            description : string,
            tags : string,
        } = await c.req.json();

        const {title, description, tags} = body;
        const tagNames = tags.split(',').map(it=>it.trim());

        if(!title || !description || tagNames.length === 0){
            return c.json({error : 'Please provide title, description and tags'},StatusCodes.BAD_REQUEST);
        }

        // Because c.get(`userId`) returned an object not an int
        // something like this {userId : 1}
        const userId = c.get(`userId`).userId;
        

        const newPost = await prisma.post.create({
            data:{
                title,
                description,
                userId :userId,
                Tag:{

                    connectOrCreate : tagNames.map(it=>({
                        where : {name : it,},
                        create : {name : it}
                    }))

                }
            }
        })

        return c.json(newPost,StatusCodes.OK);
        
    } catch (error) {
        return c.json({error : `Error creating post.${error}`},StatusCodes.INTERNAL_SERVER_ERROR)
        
    }
}
export async function getPostById(c:Context) {

    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {

         // Typecasting id to number
         const pid:number  = Number(c.req.param('id'));

         // Whenever checking if exists or not 
         // give two parameters to find and check authenticiy
         const post = await prisma.post.findUnique({
             where:{
                 id:pid,
                 userId : c.get(`userId`).userId
             }, include:{
                 Tag:true
             }
         });

         if(!post){
             return c.json({msg :'Post not found'}, StatusCodes.NOT_FOUND);
         }
         return c.json(post);
        
        
    } catch (error) {
        return c.json({error : `Error getting post by id.${error}`},StatusCodes.INTERNAL_SERVER_ERROR)
        
    }
}
export async function updatePostById(c:Context) {

    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
        const pid:number  = Number(c.req.param('id'));

        interface updatePost {
            title?:string,
            description?:string,
            tags?:string,
        }


        const body : updatePost = await c.req.json();
        const {title, description, tags} = body;
        const tagNames = tags?.split(',').map(it=>it.trim());

        const post = await prisma.post.findUnique({
            where:{
                id:pid,
                userId : c.get(`userId`).userId
            }
        });

        if(!post){
            return c.json({msg :'Post not found'}, StatusCodes.NOT_FOUND);
        }

        const updatedPost = await prisma.post.update({
                where : {
                    id:pid,
                    userId : c.get(`userId`).userId
                },
                data:{
                    title,
                    description,
                    Tag:
                    {
                        connectOrCreate : tagNames?.map(it=>({
                            where : {name : it,},
                            create : {name:it}
                        }))
                    }
                },
                include :{ // works as SQL join
                    Tag:true 
                }
            
        })

        return c.json(updatedPost,StatusCodes.OK);


    } catch (error) {
        return c.json({error : `Error updating post by id.${error}`},StatusCodes.INTERNAL_SERVER_ERROR)
        
    }
}
export async function deletePostById(c:Context) {

    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());


    try {

        const pid:number  = Number(c.req.param('id'));
        const post = await prisma.post.findUnique({
            where:{
                id:pid,
                userId : c.get(`userId`).userId
            }
        })

        if(!post){
            return c.json({msg :'Post not found'}, StatusCodes.NOT_FOUND);
        }

        await prisma.post.delete({
            where:{
                id:pid,
                userId : c.get(`userId`).userId
            },
        });

        return c.json({msg : 'Post deleted successfully'},StatusCodes.OK);
        
    } catch (error) {
        return c.json({error : `Error deleting post by id.${error}`},StatusCodes.INTERNAL_SERVER_ERROR)
        
    }
}