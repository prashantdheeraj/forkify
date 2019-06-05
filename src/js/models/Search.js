
import axios from 'axios';
import {key, proxy} from '../config';

export default class Search{
    constructor(query){
        this.query = query;
    }

    async getResults(){
    
    try {
            
            const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            //console.log(res);
            if( res.data.recipes) {
                this.result = res.data.recipes;  
            }else{
                //put a test result if limit is reached
                this.result =  [{
                    "publisher": "Allrecipes.com",
                    "social_rank": 99.81007979198002, 
                    "f2f_url": "https://www.food2fork.com/recipes/view/29159", 
                    "publisher_url": "http://allrecipes.com", 
                    "title": "Slow-Cooker Chicken Tortilla Soup", 
                    "source_url": "http://allrecipes.com/Recipe/Slow-Cooker-Chicken-Tortilla-Soup/Detail.aspx",
                    "page":1}]
                   
            }
            
           //console.log(this.result);
        }catch(error){
            alert(error);
        }
    }
}
