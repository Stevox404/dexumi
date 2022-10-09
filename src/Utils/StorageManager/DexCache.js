import Dexie from "dexie";
import moment from "moment";
import store from "Redux/store";
import { hashCode } from "Utils";

const db = new Dexie("_cache");
db.version(1).stores({
    _cache: 'name,sig'
});

export class DexCache {
    constructor(name, args = {}) {
        this.name = name;

        this.validFor = args.validFor ?? moment.duration(3, 'h');
        this.validTo = args.validTo ?? null;
        this.disabled = args.disabled ?? false;
        this.signed = args.signed ?? false;
    }

    #sig;
    data; meta;

    getMeta(key) {
        if (typeof this.meta !== 'object') return null;
        return this.meta[key];
    }

    setMeta(key, val) {
        if (typeof this.meta !== 'object') this.meta = {};
        this.meta[key] = val;
        return true;
    }

    async fetch() {
        if (DexCache.disabled || this.disabled) return null;

        if (!this.name) throw new Error('Fetch Failed. Cache has no name.');
        const sig = this.#getSig();

        const res = await db._cache.get({ name: this.name, sig });

        if (this.#shouldDestroy()) {
            await this.clear();
            return null;
        }

        if (res) Object.assign(this, res);

        return this.data;
    }

    async save() {
        if (DexCache.disabled || this.disabled) return null;

        if (!this.name) throw new Error('Save Failed. Cache has no name.');
        const date = new Date().toLocaleDateString();
        this.date = date;
        if (this.validFor) {
            if (this.validFor.toDate) {
                this.validFor = this.validFor.toDate();
            } else {
                this.validFor = Number(this.validFor);
            }
        }

        if (this.validTo) {
            if (this.validTo.toDate) {
                this.validTo = this.validTo.toDate();
            } else {
                this.validTo = Date(this.validTo);
            }
        }

        this.createdAt = new Date();

        return db.transaction('rw', db._cache, async () => {
            await DexCache.clear(this.name);
            await db._cache.put({
                ...this.#toJSON(),
                sig: this.#getSig(),
            });
        });
    }

    clear() {
        if (!this.name) throw new Error('Clear Failed. Cache has no name.');
        return db._cache.delete(this.name);
    }



    // Statics

    static async clear(name) {
        if (!name) throw new Error('Invalid argument.');
        return db._cache.delete(name);
    }

    static async delete() {
        db.close();
        await db.delete();
        db.version(1).stores({
            _cache: 'name'
        });
    }

    // Private fn

    #toJSON() {
        return ({
            name: this.name,
            validFor: this.validFor,
            validTo: this.validTo,
            disabled: this.disabled,
            signed: this.signed,
            data: this.data,
            meta: this.meta,
        })
    }

    #shouldDestroy() {
        let eol;
        if (this.validFor) {
            eol = moment(this.createdAt).add(this.validFor);
        } else if (this.validTo) {
            eol = moment(this.validTo);
        }
        if (eol && eol.isValid()) return eol < moment();
        return false;
    }

    #getSig() {
        if(!this.signed) return '';
        if (this.#sig) return this.#sig;

        const { user } = store.getState();
        if (!user) {
            if (this.signed) console.warn('Cache expected user to be logged in');
            return '';
        }
        const code = hashCode(user.username);
        this.#sig = code;
        return code;
    }
}