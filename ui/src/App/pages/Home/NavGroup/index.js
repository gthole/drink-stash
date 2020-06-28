import React from 'react';
import { faCocktail, faBookmark, faPlus } from '@fortawesome/free-solid-svg-icons'
import { services } from '../../../../services';
import { NavSection } from '../NavSection';

export function NavGroup() {
    const user = services.auth.getUserData();
    return (
        <div className="NavGroup">
            <NavSection
                icon={ faCocktail }
                title="Recipes"
                description="Search the cocktail recipes and find something new."
                href="/recipes"
            />
            <NavSection
                icon={ faBookmark }
                title="Build Lists"
                description="Keep track of what you've tried and what you like, or bookmark drinks to try later."
                href={ `/users/${user.username}/lists` }
            />
            <NavSection
                icon={ faPlus }
                title="Add Recipes"
                description="Add your favorite recipes to the database and share with others."
                href="/new"
            />
        </div>
    );
}
