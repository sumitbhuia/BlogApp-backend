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

export async function getAllTags(c:Context) {
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {

        const alltags = await prisma.tag.findMany();
        return c.json(alltags,StatusCodes.OK)
        
    } catch (error) {
        return c.json({error : `Error getting all tags.${error}`},StatusCodes.INTERNAL_SERVER_ERROR)
    }
}
export async function getTagByName(c:Context) {
    const prisma = new PrismaClient({
        datasourceUrl : c.env.DATABASE_URL,
    }).$extends(withAccelerate());


   try {
    const tagName = c.req.param(`tag`);
    if(!tagName) return c.json({error : `Tag name is required`},StatusCodes.BAD_REQUEST);

    const tag = await prisma.tag.findMany({
        where : {
            name : tagName
        },
        include : {
            Post : true
        }
    })

    return c.json(tag,StatusCodes.OK)
    
   } catch (error) {
        return c.json({error : `Error getting tag by tagname.${error}`},StatusCodes.INTERNAL_SERVER_ERROR)
   } 
}