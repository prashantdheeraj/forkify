
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';

import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';


import {elements, renderLoader, clearLoader} from './views/base';


/** GLOBAL STATE OF THE APP
 * Search object
 * Current receipe object 
 * Shopping list object
 * Liked receipes
 * 
 */

const state = {};
window.state = state;

/*******************
*SEARCH CONTROLLER
********************/

const controlSearch = async () => {
    // 1. Get the query from the view
    const query = searchView.getInput();
    //console.log(query);

    if(query){
     // 2. New Serach Object and add it to state
     state.search = new Search(query) ;

     // 3. Prepare UI for results
     searchView.clearInput();
     searchView.clearResults();
     renderLoader(elements.searchRes);

     
     try{
        // 4. Search for Receipes
        await state.search.getResults();

        // 5. Render results on UI
        clearLoader();  
        searchView.renderResults(state.search.result)
     }catch(err){
        alert("Something wrong with the search..");
        clearLoader();  
     }
     

    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = parseInt(btn.dataset.goto, 10);

        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage)
    }
});

/*******************
*RECIPE CONTROLLER
********************/

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

const controlRecipe = async () => {
    //Get the ID from the URL
    const id = window.location.hash.replace('#','');
    //console.log(id);
    if(id){
        //Prepare UI from Changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight the selected serach item
        if(state.search) searchView.highlightSelected(id);

        //Create new recipe objects
        state.recipe = new Recipe(id);

        try{
             //Get recipe data
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //Render Recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );

        } catch(err){
            alert('Error processing recipe!!');
        }
    }
}

/*******************
*LIST CONTROLLER
********************/
const controlList = () => {
    //Create a new List if there is none yet
    if(!state.list) state.list = new List();

    // Add each ingredient to the list and render element
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

//Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid ;

    //Handle the delete event
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        //Delete from state
        state.list.deleteItem(id);

        //Delete from UI
        listView.deleteItem(id);

        //Handle the count update
    } else if(e.target.matches('.shopping__count-value')){
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
})

/*******************
*LIKE CONTROLLER
********************/
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;

    //User has NOt yet liked current recipe
    if(state.likes.isLiked(currentId)){
        // Add like to the state
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        //toggle the like button
        likesView.toggleLikeBtn(true);

        //Add like to the UI list
        likesView.renderLike(newLike);

    //User  liked current recipe
    }else{
        // Remove like to the state
        state.likes.deleteLike(currentId);

        //toggle the like button
        likesView.toggleLikeBtn(false);

        //Remove like to the UI list
        likesView.deleteLike(currentID);

    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}


// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    //Restore like
    state.likes.readStorage();

    //Tohggle likes button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    //Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        //Decrease button is clicked
        if (state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }else if (e.target.matches('.btn-increase, .btn-increase *')){
        //Increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        //Add ingredients to shopping list
        controlList();
    }else if (e.target.matches('.recipe__love, .recipe__love *')){
        //Like Controller
        controlLike();
    }
});