import React, { useEffect, useState } from 'react';
import './style.css';
import { useParams, useHistory } from 'react-router-dom';
import { Select, Input, TextArea, Button, FormWrapper } from 'components/Forms';
import { Card } from 'components/Card';
import { TagSet } from 'pages/RecipeEdit/TagSet';
import { QuantitySet } from 'pages/RecipeEdit/QuantitySet';
import { services } from 'services';
import { RecipeService } from 'services/recipes';

export function RecipeEdit() {
    const [content, setContent] = useState(null);
    const [saving, setSaving] = useState(false);
    const { slug } = useParams();
    const history = useHistory();

    useEffect(() => {
        async function getRecipe() {
            if (!slug) {
                return RecipeService.createNew();
            }
            return await services.recipes.getById(slug);
        }

        Promise.all([
            getRecipe(),
            services.books.getPage(),
            services.ingredients.getPage(),
            services.tags.getPage(),
            services.uom.getPage(),
        ]).then(([recipe, bookResp, ingredientResp, tagResp, uomResp]) => {
            const ingredients = ingredientResp.results.sort((a, b) => (
                a.usage > b.usage ? -1 : 1
            ));
            if (!recipe.book || !recipe.book.id) {
                recipe.book = bookResp.results[0];
            }
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
            saved = await services.recipes.update(content.recipe);
        } else {
            saved = await services.recipes.create(content.recipe);
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
        // TODO: Check for the same name / book pair
        // TODO: Validation
    }

    function addQuantity() {
        content.recipe.addQuantity();
        setContent(Object.assign({}, content));
        setTimeout(() => document.querySelectorAll(".QuantityRow:last-child .amount input")[0].focus(), 200)
    }

    if (!content) {
        return '';
    }

    const saveButton = (
        <Button
            type="primary"
            onClick={ () => save() }
            disabled={ saving }>
            Save
        </Button>
    );
    let buttons;
    if (slug) {
        buttons = (
            <div className="save-buttons">
                <Button
                    type="danger"
                    onClick={ () => history.goBack() }
                    disabled={ saving }>
                    Cancel
                </Button>
                { saveButton }
            </div>
        );
    } else {
        buttons = (
            <div className="save-buttons">
                { saveButton }
                <Button
                    type="primary"
                    onClick={ () => saveAndNew() }
                    disabled={ saving}>
                    Save and New
                </Button>
            </div>
        );
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
                    onChange={ (ev) => update('book', {id: ev.target.value}) }
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
                <Button
                    className="quantity-button"
                    type="primary"
                    onClick={ () => addQuantity() }
                    children={<b>+</b>}
                />
                <TextArea
                    label="Directions"
                    subtext="Shaken or stirred? Glassware? Garnish?"
                    expanded={ true }
                    value={ content.recipe.directions }
                    onChange={ (ev) => update('directions', ev.target.value) }
                />
                <FormWrapper label="Tags">
                    <TagSet
                        tags={ content.recipe.tags }
                        sourceTags={ content.tags }
                        setTags={ (tags) => update('tags', tags) }
                    />
                </FormWrapper>
                <TextArea
                    label="Description"
                    subtext="Tasting notes, cocktail type, whatever you want."
                    expanded={ true }
                    value={ content.recipe.description }
                    onChange={ (ev) => update('description', ev.target.value) }
                />
                { buttons }
            </Card>
        </div>
    );
}
