import { ActivityService } from './activities';
import { AuthService } from './auth';
import { BookService } from './books';
import { CommentService } from './comments';
import { IngredientService } from './ingredients';
import { ListService, ListRecipeService } from './lists';
import { RecipeService } from './recipes';
import { TagService } from './tags';
import { UomService } from './uom';
import { UserService } from './users';

export const services = {
    activities: new ActivityService(),
    auth: new AuthService(),
    books: new BookService(),
    comments: new CommentService(),
    ingredients: new IngredientService(),
    listRecipes: new ListRecipeService(),
    lists: new ListService(),
    recipes: new RecipeService(),
    tags: new TagService(),
    uom: new UomService(),
    users: new UserService(),
};
