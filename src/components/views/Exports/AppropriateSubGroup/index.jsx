import React, { useState, useEffect } from 'react';
import apiURL from '../../../../axios/axiosConfig';

import { message } from 'antd';
import dayjs from 'dayjs';

import CustomExport from '../../../commons/CustomExport';
import {
    baseColumns,
    caloriasMacronutrientes,
    vitaminas,
    minerales,
    aspectoGlucemico,
    aspectosMedioambientales,
    aspectosEconomicos,
    componentesBioactivos,
    aditivosAlimentarios,
    extraColumns,
    groupColumns,
} from '../data';
import groups from '../data/excelGroups';
import keys from '../data/excelKeys';
import {
    getArrayByGroups,
    normalizeArrayToExport,
    getRowValues,
    generateCsvRows,
    unifyGroups,
    generateFinalCsvRows,
    getFinalColumns,
} from '../utils';
import { isEmptyArray } from '../../../../utils';

const AppropriateSubGroup = ({ selected = false, setLoading }) => {
    const [columns, setColumns] = useState([
        ...baseColumns,
        ...groupColumns,
        ...extraColumns,
        ...caloriasMacronutrientes,
        ...vitaminas,
        ...minerales,
        ...aspectoGlucemico,
        ...aspectosMedioambientales,
        ...aspectosEconomicos,
        ...componentesBioactivos,
        ...aditivosAlimentarios,
    ]);
    const [foodReady, setFoodReady] = useState(false);
    const [usersData, setUsersData] = useState([]);
    const [exportData, setExportData] = useState(null);
    const [fileReady, setFileReady] = useState(false);

    useEffect(() => {
        selected && getExportData();
        return () => {
            setExportData(null);
            setFileReady(false);
        };
    }, [selected]);

    useEffect(() => {
        foodReady && createExportData();
    }, [foodReady]);

    useEffect(() => {
        return () => {
            setLoading(false);
        };
    }, []);

    const onFileReady = () => {
        setFileReady(true);
        setLoading(false);
    };

    const handleCancel = () => {
        setFileReady(false);
        setExportData(null);
        setLoading(false);
    };

    const getExportData = async () => {
        console.log('Obteniendo datos de exportaci??n...');
        try {
            const foods = [];
            const usersAux = [];

            const { data } = await apiURL.get('registroDietetico/exports');

            if (data?.length <= 0) {
                message.error('No hay datos para exportar');
                handleCancel();
                return;
            }
            data.forEach((elem) => {
                const { alimentos, horario, id, usuario } = elem;

                alimentos.forEach((food) =>
                    foods.push({
                        ...food.id,
                        cantidad: food.cantidad,
                        horario,
                        idRegistro: id,
                        usuario,
                    })
                );
            });

            foods.forEach((food) => {
                const { usuario, horario, idRegistro, subGrupoAdecuada } = food;

                const isPartOfGroup =
                    groups[keys.subGrupoAdecuada].includes(subGrupoAdecuada);

                if (!isPartOfGroup) return;

                const date = dayjs(horario).format('DD/MM/YYYY');

                const newData = {
                    idRegistro,
                    idParticipante: usuario,
                    fechaRegistro: date,
                };

                const newState = normalizeArrayToExport({
                    state: getArrayByGroups(groups[keys.subGrupoAdecuada]),
                    group: subGrupoAdecuada,
                    food,
                });

                const auxSuper = {
                    ...newData,
                    ...newState,
                };

                usersAux.push(auxSuper);
            });

            setUsersData(usersAux);
            setFoodReady(true);
        } catch (error) {
            handleCancel();
            message.error('Error al obtener los datos');
            console.groupCollapsed('[Exports] getExportData');
            console.error(error);
            console.groupEnd();
        }
    };

    const createExportData = () => {
        console.log('Armando los datos de exportaci??n...');
        try {
            const rows = getRowValues(usersData);
            const unified = unifyGroups(rows);

            if (isEmptyArray(unified)) {
                message.info('No hay datos para exportar');
                handleCancel();
                return;
            }

            const csvRowsPreview = generateCsvRows(unified, 4);
            const cvsRows = generateFinalCsvRows(csvRowsPreview, keys.subGrupoAdecuada);
            const finalColumns = getFinalColumns(
                columns,
                groups[keys.subGrupoAdecuada].length
            );

            setColumns(finalColumns);
            setExportData(cvsRows);
            setTimeout(() => {
                onFileReady();
            }, 1000);
        } catch (error) {
            handleCancel();
            message.error('Ocurri?? un error al armar los datos para exportar');
            console.groupCollapsed('[Exports] createExportData');
            console.error(error);
            console.groupEnd();
        }
    };
    return (
        <CustomExport
            dataSource={exportData}
            columns={columns}
            fileReady={fileReady}
            fileName={`Sub-Grupo Adecuada ${dayjs(new Date()).format('DD-MM-YYYY')}`}
        />
    );
};

export default AppropriateSubGroup;
