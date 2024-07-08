import { Hono } from "hono";
import { getAllTags, getTagByName} from "../controller/tagController";
export const tagRouter = new Hono();

tagRouter.get('/allTags', getAllTags);
tagRouter.get('/:tag', getTagByName);