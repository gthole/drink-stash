import React, { useState, useContext } from 'react';
import './style.css';
import { useParams, useHistory } from 'react-router-dom';
import { Select, Input, TextArea, Button, FormWrapper } from 'components/Forms';
import { Card } from 'components/Structure';
import { AppContext } from 'context/AppContext';
import { useAlertedEffect } from 'hooks/useAlertedEffect';
import { TagListEdit } from 'components/TagList';
import { QuantitySet } from 'pages/RecipeEdit/QuantitySet';
import { services } from 'services';
import { RecipeService } from 'services/recipes';

export function RecipeEdit({location}) {
    const { addAlert } = useContext(AppContext);
    const [content, setContent] = useState(null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const { slug } = useParams();
    const history = useHistory();
    const initial = location.state ? location.state.recipe : null;

    useAlertedEffect(async () => {
        async function getRecipe() {
            if (!slug) {
                return RecipeService.createNew(initial);
            }
            return await services.recipes.getById(slug);
        }

        const [recipe, bookResp, ingredientResp, tagResp, uomResp] = await Promise.all([
            getRecipe(),
            services.books.getPage(),
            services.ingredients.getPage(),
            services.tags.getPage(),
            services.uom.getPage(),
        ]);

        const ingredients = ingredientResp.results.sort((a, b) => a.usage > b.usage ? -1 : 1);
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
    }, [slug]);

    async function handleError(e) {
        setSaving(false);
        if (e.status === 400) {
            setErrors(await e.json());
        } else {
            addAlert('error', 'An unexpected error occured. Please try again later.');
        }
        setTimeout(() => window.scrollTo({top: 0, behavior: 'smooth'}), 0);
    }

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
        try {
            const saved = await _save();
            history.push(`/recipes/${ saved.slug }`, {});
        } catch (e) {
            handleError(e);
        }
    }

    async function saveAndNew() {
        try {
            await _save();
            const r = RecipeService.createNew();
            r.book = content.recipe.book;
            r.source = content.recipe.source;
            content.recipe = r;
            setContent(Object.assign({}, content));
            setErrors({});
            document.getElementById('recipe-name').focus();
        } catch (e) {
            handleError(e);
        }
    }

    function update(attr, value) {
        content.recipe[attr] = value;
        setContent(Object.assign({}, content));
    }

    async function checkName() {
        if (!content.recipe.name) return
        const r = await services.recipes.getPage({
            name: content.recipe.name,
            book_id: content.recipe.book.id,
            per_page: 1,
        });
        if (r.results.length && content.recipe.id !== r.results[0].id) {
            addAlert(
                'warn',
                'A recipe with that name already exists in this book'
            );
        }
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
                    onClick={ () => {
                        services.recipes.removeById(content.recipe.id).then(() => {
                            history.push('/', {});
                        });
                    }}
                    disabled={ saving }>
                    Delete
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
                    id="book"
                    subtext="(Required) Which book does this recipe belong to?"
                    choices={ content.books }
                    display="name"
                    select="id"
                    value={ content.recipe.book.id }
                    onChange={ (ev) => update('book', {id: ev.target.value}) }
                    onBlur={ checkName }
                />
                <Input
                    label="Name"
                    subtext="(Required) What is the name of the recipe? The name must be unique within the book."
                    value={ content.recipe.name }
                    error={ errors.name }
                    onChange={ (ev) => update('name', ev.target.value) }
                    onBlur={ checkName }
                    id="recipe-name"
                />
                <div className="input-row">
                    <Input
                        label="Source Notes"
                        id="source"
                        subtext="Any additional source information?"
                        value={ content.recipe.source }
                        error={ errors.source }
                        onChange={ (ev) => update('source', ev.target.value) }
                    />
                    <Input
                        label="URL"
                        id="url"
                        subtext="A URL to view the original recipe if available."
                        value={ content.recipe.url || '' }
                        error={ errors.url }
                        onChange={ (ev) => update('url', ev.target.value) }
                    />
                </div>
                <QuantitySet
                    quantities={ content.recipe.quantities }
                    ingredients={ content.ingredients }
                    uom={ content.uom }
                    error={ errors.quantity_set }
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
                    id="directions"
                    subtext="Shaken or stirred? Glassware? Garnish?"
                    error={ errors.directions }
                    expanded={ true }
                    value={ content.recipe.directions }
                    onChange={ (ev) => update('directions', ev.target.value) }
                />
                <FormWrapper label="Tags">
                    <TagListEdit
                        tags={ content.recipe.tags }
                        sourceTags={ content.tags }
                        setTags={ (tags) => update('tags', tags) }
                    />
                </FormWrapper>
                <TextArea
                    label="Description"
                    id="description"
                    subtext="Tasting notes, cocktail type, whatever you want."
                    error={ errors.description }
                    expanded={ true }
                    value={ content.recipe.description }
                    onChange={ (ev) => update('description', ev.target.value) }
                />
                { buttons }
            </Card>
        </div>
    );
}
