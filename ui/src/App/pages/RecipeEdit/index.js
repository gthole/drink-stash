import React, { useEffect, useState } from 'react';
import './style.css';
import { useParams, useHistory } from 'react-router-dom';
import { Select, Input, TextArea, Button } from '../../components/Forms';
import { Card } from '../../components/Card';
import { TagSet } from '../../components/TagSet';
import { QuantitySet } from './QuantitySet';
import { BookService } from '../../../services/books';
import { IngredientService } from '../../../services/ingredients';
import { RecipeService } from '../../../services/recipes';
import { TagService } from '../../../services/tags';
import { UomService } from '../../../services/uom';

const bookService = new BookService();
const ingredientService = new IngredientService();
const recipeService = new RecipeService();
const tagService = new TagService();
const uomService = new UomService();

export function RecipeEdit() {
    const [content, setContent] = useState(null);
    const [saving, setSaving] = useState(false);
    const { slug } = useParams();
    const history = useHistory();

    useEffect(() => {
        async function getRecipe() {
            if (slug === 'new') {
                return RecipeService.createNew();
            }
            return await recipeService.getById(slug);
        }

        Promise.all([
            getRecipe(),
            bookService.getPage(),
            ingredientService.getPage(),
            tagService.getPage(),
            uomService.getPage(),
        ]).then(([recipe, bookResp, ingredientResp, tagResp, uomResp]) => {
            const ingredients = ingredientResp.results.sort((a, b) => (
                a.usage > b.usage ? -1 : 1
            ));
            setContent({
                recipe,
                books: bookResp.results,
                ingredients: ingredients,
                tags: tagResp.results,
                uom: uomResp.results,
            });
        });
    }, [slug]);

    async function _save() {
        setSaving(true);
        let saved;
        if (content.recipe.id) {
            saved = await recipeService.update(content.recipe);
        } else {
            saved = await recipeService.create(content.recipe);
        }
        setSaving(false);
        return saved;
    }

    async function save() {
        const saved = await _save();
        history.push(`/recipes/${ saved.slug }`, {});
    }

    async function saveAndNew() {
        await _save();
        const r = RecipeService.createNew();
        r.book = content.recipe.book;
        r.source = content.recipe.source;
        content.recipe = r;
        setContent(Object.assign({}, content));
    }

    function update(attr, value) {
        content.recipe[attr] = value;
        setContent(Object.assign({}, content));
    }

    if (!content) {
        return '';
    }

    return (
        <div className="RecipeEdit page-container">
            <Card>
                <Select
                    label="Book"
                    choices={ content.books }
                    display="name"
                    select="id"
                    value={ content.recipe.book.id }
                    onChange={ (ev) => update('book', ev.target.value) }
                />
                <div className="input-row">
                    <Input
                        label="Name"
                        value={ content.recipe.name }
                        onChange={ (ev) => update('name', ev.target.value) }
                    />
                </div>
                <div className="input-row">
                    <Input
                        label="Source"
                        value={ content.recipe.source }
                        onChange={ (ev) => update('source', ev.target.value) }
                    />
                    <Input
                        label="URL"
                        value={ content.recipe.url || '' }
                        onChange={ (ev) => update('url', ev.target.value) }
                    />
                </div>
                <QuantitySet
                    quantities={ content.recipe.quantities }
                    ingredients={ content.ingredients }
                    uom={ content.uom }
                    setQuantities={ (quantities) => update('quantities', quantities) }
                />
                <TextArea
                    label="Directions"
                    subtext="Shaken or stirred? Glassware? Garnish?"
                    expanded={ true }
                    value={ content.recipe.directions }
                    onChange={ (ev) => update('directions', ev.target.value) }
                />
                <TagSet
                    tags={ content.recipe.tags }
                    sourceTags={ content.tags }
                    setTags={ (tags) => update('tags', tags) }
                />
                <TextArea
                    label="Description"
                    subtext="Tasting notes, cocktail type, whatever you want."
                    expanded={ true }
                    value={ content.recipe.description }
                    onChange={ (ev) => update('description', ev.target.value) }
                />
                <div className="save-buttons">
                    <Button
                        type="primary"
                        onClick={ () => save() }
                        disabled={ saving }>
                        Save
                    </Button>
                    <Button
                        type="primary"
                        onClick={ () => saveAndNew() }
                        disabled={ saving}>
                        Save and New
                    </Button>
                </div>
            </Card>
        </div>
    );
}
