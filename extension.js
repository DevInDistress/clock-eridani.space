/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Eridanian Clock'));

        this._label = new St.Label({
            text: getEridianTime(),
            style: 'font-family: Arial',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.add_child(this._label);

        this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2366, () => {
            this._label.text = getEridianTime();
            return GLib.SOURCE_CONTINUE;
        });

        this.connect('destroy', () => {
            if (this._timeoutId) {
                GLib.Source.remove(this._timeoutId);
                this._timeoutId = 0;
            }
        });
    }
});

export default class IndicatorExampleExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._settingsChangedId = this._settings.connect('changed::position', () => {
            this._rebuildIndicator();
        });

        this._rebuildIndicator();
    }

    disable() {
        if (this._settingsChangedId && this._settings)
            this._settings.disconnect(this._settingsChangedId);

        this._settingsChangedId = 0;
        this._settings = null;

        if (this._indicator)
            this._indicator.destroy();

        this._indicator = null;
    }

    _rebuildIndicator() {
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }

        this._indicator = new Indicator();

        const side = this._settings.get_string('position') === 'left' ? 'left' : 'right';
        const position = Main.sessionMode.panel[side].length;
        Main.panel.addToStatusArea(this.uuid, this._indicator, position, side);
    }
}

function convertDigit(number) {
    switch (number) {
    case 0:
        return 'ℓ';
    case 1:
        return 'I';
    case 2:
        return 'V';
    case 3:
        return 'λ';
    case 4:
        return '+';
    case 5:
        return '∀';
    default:
        return '?';
    }
}

function getTime() {
    return Date.now();
}

function getTimeAsEridianMillis() {
    return Math.floor(getTime() / 2366) % 46656;
}

function toSenary() {
    let time = getTimeAsEridianMillis();
    let result = '';

    while (time > 0) {
        const remainder = time % 6;
        result = convertDigit(remainder) + result;
        time = Math.floor(time / 6);
    }

    return result || convertDigit(0);
}

function getEridianTime() {
    return toSenary();
}
