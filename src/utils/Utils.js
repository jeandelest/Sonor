import C from './constants.json';
import D from '../i18n';

class Utils {
  static convertToDateString(timestamp, locales, options) {
    return new Date(timestamp).toLocaleDateString(locales, options);
  }

  static convertMsToHoursMinutes(millis) {
    const date = new Date(millis);
    /*     if(date.getHours.length === 1){
      return `${"0" + date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`;
    } */
    return `${`0${date.getHours()}`.slice(-2)}:${
      (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
    }`;
  }

  // TODO handle zero case here instead of return NaN
  static calculateCompletionRate(data) {
    return (data.tbrCount + data.finCount + data.cloCount) / data.total;
  }

  static calculateOngoing(data) {
    return data.prcCount + data.aocCount + data.apsCount + data.insCount;
  }

  static calculateCollectionRate(outcomes, stateCount) {
    return outcomes.inaCount / stateCount.total;
  }

  static calculateWasteRate(outcomes, stateCount) {
    return (outcomes.refCount + outcomes.impCount + stateCount.npiCount) / stateCount.total;
  }

  // Comming soon with business rule
  static calculateOutOfScopeRateInterviewer(outcomes, stateCount) {
    return (
      (outcomes.ucdCount +
        outcomes.utrCount +
        outcomes.alaCount +
        outcomes.dcdCount +
        outcomes.nuhCount +
        outcomes.dukCount +
        outcomes.duuCount +
        outcomes.noaCount +
        stateCount.npxCount +
        stateCount.rowCount) /
      (stateCount.total - stateCount.npaCount)
    );
  }

  static calculateOutOfScopeRateManagement(outcomes, stateCount) {
    return (
      (outcomes.ucdCount +
        outcomes.utrCount +
        outcomes.alaCount +
        outcomes.dcdCount +
        outcomes.nuhCount +
        outcomes.dukCount +
        outcomes.duuCount +
        outcomes.noaCount +
        stateCount.npxCount +
        stateCount.rowCount) /
      stateCount.total
    );
  }

  static formatForMonitoringTable(stateCount) {
    const line = {};
    line.completionRate = this.calculateCompletionRate(stateCount);
    line.total = stateCount.total - stateCount.nvmCount - stateCount.nvaCount;
    line.notStarted = stateCount.vicCount;
    line.onGoing = this.calculateOngoing(stateCount);
    line.waitingForIntValidation = stateCount.wftCount;
    line.intValidated = stateCount.tbrCount + stateCount.wfsCount;
    line.demValidated = stateCount.finCount + stateCount.cloCount;
    line.preparingContact = stateCount.prcCount;
    line.atLeastOneContact = stateCount.aocCount;
    line.appointmentTaken = stateCount.apsCount;
    line.interviewStarted = stateCount.insCount;
    line.noticeLetter = stateCount.noticeCount;
    line.reminders = stateCount.reminderCount;

    return line;
  }

  static formatForCollectionTable(initialObject, outcomes, stateCount) {
    const line = initialObject;

    line.collectionRate = this.calculateCollectionRate(outcomes, stateCount);
    line.wasteRate = this.calculateWasteRate(outcomes, stateCount);
    line.outOfScopeRate = this.calculateOutOfScopeRateManagement(outcomes, stateCount);
    line.surveysAccepted = outcomes.inaCount;
    line.refusal = outcomes.refCount;
    line.unreachable = outcomes.impCount;
    line.outOfScope =
      outcomes.ucdCount +
      outcomes.utrCount +
      outcomes.alaCount +
      outcomes.dcdCount +
      outcomes.nuhCount +
      outcomes.dukCount +
      outcomes.duuCount +
      outcomes.noaCount;
    line.totalProcessed = stateCount.tbrCount + stateCount.finCount;
    line.absInterviewer = stateCount.npaCount;
    line.otherReason = stateCount.npiCount + stateCount.npxCount + stateCount.rowCount;
    line.totalClosed =
      stateCount.npaCount + stateCount.npiCount + stateCount.npxCount + stateCount.rowCount;
    line.allocated = stateCount.total;

    return line;
  }

  static formatForProvisionalStatusTable(initialObject, closingCauses) {
    const line = {};
    if (initialObject.interviewer) {
      line.interviewerFirstName = initialObject.interviewer.interviewerFirstName;
      line.interviewerLastName = initialObject.interviewer.interviewerLastName;
      line.interviewerId = initialObject.interviewer.id;
    }
    if (initialObject.survey) {
      line.survey = initialObject.survey;
    }
    line.npiCount = closingCauses.npiCount;
    line.npxCount = closingCauses.npxCount;
    line.npaCount = closingCauses.npaCount;
    line.rowCount = closingCauses.rowCount;
    line.total = closingCauses.npaCount + closingCauses.npiCount + closingCauses.rowCount;
    line.allocated = closingCauses.total;
    return line;
  }

  static getCampaignPhase(collectionStartDate, collectionEndDate, endDate) {
    const now = new Date().getTime();
    if (!collectionStartDate || now < collectionStartDate) {
      return 0;
    }
    if (!collectionEndDate || now < collectionEndDate) {
      return 1;
    }
    if (!endDate || now < endDate) {
      return 2;
    }
    return 3;
  }

  static displayCampaignPhase(campaignPhase) {
    switch (campaignPhase) {
      case 0:
        return D.initialAssignment;
      case 1:
        return D.collectionInProgress;
      case 2:
        return D.collectionOver;
      case 3:
        return D.treatmentOver;
      default:
        return '';
    }
  }

  static getSortFunction(sortOn, desc, mainSort) {
    let mult = 1;
    if (desc) {
      mult = -1;
    }
    let mainSortFunc;
    if (mainSort) {
      mainSortFunc = Utils.getSortFunction(mainSort);
    }

    const labelsSimpleSort = [
      'city',
      'departement',
      'ssech',
      'campaignLabel',
      'interviewer',
      'campaign',
      'label',
      'id',
      'displayName',
      'identificationState',
      'survey',
      'site',
      'date',
      'finalizationDate',
    ];
    if (labelsSimpleSort.includes(sortOn)) {
      return (a, b) => {
        if (a[sortOn] < b[sortOn]) {
          return -1 * mult;
        }
        if (a[sortOn] !== b[sortOn]) {
          return 1 * mult;
        }
        return mainSort ? mainSortFunc(a, b) : 0;
      };
    }
    if (sortOn === 'state') {
      return (a, b) => {
        const aState = a.closingCause ? D[a.closingCause] : undefined;
        const bState = b.closingCause ? D[b.closingCause] : undefined;

        if (!aState || !bState) {
          return aState ? -1 * mult : 1 * mult;
        }
        if (aState !== bState) {
          return (aState < bState ? -1 : 1) * mult;
        }
        return mainSort ? mainSortFunc(a, b) : 0;
      };
    }

    if (sortOn === 'CPinterviewer') {
      return (a, b) => {
        const aString = a.interviewerLastName + a.interviewerFirstName;
        const bString = b.interviewerLastName + b.interviewerFirstName;
        if (aString < bString) {
          return -1 * mult;
        }
        if (aString !== bString) {
          return 1 * mult;
        }
        return mainSort ? mainSortFunc(a, b) : 0;
      };
    }
    if (sortOn === 'contactOutcomeDate') {
      return (a, b) => {
        const dateA = a.contactOutcome.date;
        const dateB = b.contactOutcome.date;
        if (!dateA || !dateB) {
          return dateA ? 1 * mult : -1 * mult;
        }
        if (dateA !== dateB) {
          return (dateA < dateB ? -1 : 1) * mult;
        }
        return mainSort ? mainSortFunc(a, b) : 0;
      };
    }
    if (sortOn === 'contactOutcomeType') {
      const contactOutcomeTypeOrder = {
        INA: 1,
        REF: 2,
        IMP: 3,
        UTR: 4,
        DCD: 5,
        NUH: 6,
        ALA: 7,
        UCD: 8,
        DUK: 9,
        DUU: 10,
        NOA: 11,
        ACP: 12,
        NER: 13,
      };

      return (a, b) => {
        const typeAOrder =
          a?.contactOutcome !== undefined && a?.contactOutcome?.type !== undefined
            ? contactOutcomeTypeOrder[a.contactOutcome?.type]
            : 14;
        const typeBOrder =
          b?.contactOutcome !== undefined && b?.contactOutcome?.type !== undefined
            ? contactOutcomeTypeOrder[b.contactOutcome?.type]
            : 14;

        if (!typeAOrder || !typeBOrder) {
          return typeAOrder ? -1 * mult : 1 * mult;
        }
        if (typeAOrder !== typeBOrder) {
          return (typeAOrder < typeBOrder ? -1 : 1) * mult;
        }

        return mainSort ? mainSortFunc(a, b) : 0;
      };
    }
    if (sortOn === 'contact_outcome') {
      return (a, b) => {
        if (!a.contactOutcome && !!b.contactOutcome) {
          return -1 * mult;
        }
        if (!!a.contactOutcome && !b.contactOutcome) {
          return 1 * mult;
        }
        if (!a.contactOutcome && !b.contactOutcome) {
          return mainSort ? mainSortFunc(a, b) : 0;
        }
        if (D[a.contactOutcome] < D[b.contactOutcome]) {
          return -1 * mult;
        }
        if (a.contactOutcome !== b.contactOutcome) {
          return 1 * mult;
        }
        return mainSort ? mainSortFunc(a, b) : 0;
      };
    }
    if (['interviewer_terminated', 'interviewer_closable'].includes(sortOn)) {
      return (a, b) => {
        const aString = a.interviewer.interviewerLastName + a.interviewer.interviewerFirstName;
        const bString = b.interviewer.interviewerLastName + b.interviewer.interviewerFirstName;
        if (aString < bString) {
          return -1 * mult;
        }
        if (aString !== bString) {
          return 1 * mult;
        }
        return mainSort ? mainSortFunc(a, b) : 0;
      };
    }
    return (a, b) =>
      a[sortOn] === b[sortOn] && mainSort ? mainSortFunc(a, b) : (a[sortOn] - b[sortOn]) * mult;
  }

  static sortData(data, sortOn, asc, mainSortAttr) {
    const sortedData = [...data];
    const attrs = {
      CPue: 'surveyUnitCount',
      CPidep: 'id',
    };
    const sortBy = attrs[sortOn] || sortOn;
    sortedData.sort(this.getSortFunction(sortBy, sortOn && !asc, mainSortAttr));
    return sortedData;
  }

  static addIfNotAlreadyPresent(array, element) {
    if (!array.some(elm => elm.id === element.id)) {
      array.push(element);
    }
  }

  static sumOn(data, groupBy) {
    const result = {};
    data
      .filter(elm => elm.stateCount)
      .forEach(elm => {
        if (!Object.prototype.hasOwnProperty.call(result, elm[groupBy])) {
          result[elm[groupBy]] = JSON.parse(JSON.stringify(elm));
        } else {
          Object.entries(elm.stateCount)
            .filter(x => !isNaN(x[1]))
            .forEach(([key, val]) => {
              result[elm[groupBy]].stateCount[key] += val;
            });
        }
      });
    const finalArray = Object.keys(result).map(key => {
      const formattedData = this.formatForMonitoringTable(result[key].stateCount);
      formattedData.interviewerFirstName = result[key].interviewerFirstName;
      formattedData.interviewerLastName = result[key].interviewerLastName;
      formattedData.interviewerId = result[key].interviewerId;
      return formattedData;
    });

    return finalArray;
  }

  static getStateCountSum(data) {
    const result = {};
    data
      .filter(elm => elm.stateCount)
      .forEach(elm => {
        Object.keys(elm.stateCount)
          .filter(key => !isNaN(elm.stateCount[key]))
          .forEach(key => {
            result[key] = result[key] + elm.stateCount[key] || elm.stateCount[key];
          });
      });

    return this.formatForMonitoringTable(result);
  }

  static sumElms(data) {
    const result = {};
    data.forEach(elm => {
      Object.keys(elm)
        .filter(key => !isNaN(elm[key]))
        .forEach(key => {
          result[key] = result[key] + elm[key] || elm[key];
        });
    });
    return result;
  }

  static getMonitoringTableModeFromPath(path) {
    if (path.includes('/sites/')) {
      return C.BY_SITE;
    }
    if (path.includes('/interviewer')) {
      return C.BY_SURVEY_ONE_INTERVIEWER;
    }
    if (path.includes('/campaigns')) {
      return C.BY_SURVEY;
    }
    if (path.includes('/interviewers')) {
      return C.BY_INTERVIEWER;
    }
    return C.BY_INTERVIEWER_ONE_SURVEY;
  }

  static isVisible(survey, date) {
    let dateToUse = date || new Date().getTime();
    if (typeof dateToUse === 'string') {
      dateToUse = new Date(dateToUse).getTime();
    }
    return (
      survey.managementStartDate < dateToUse && (!survey.endDate || survey.endDate > dateToUse)
    );
  }

  static handleSort(sortOn, data, sort, view, asc) {
    let newOrder = asc;
    if (asc === undefined) {
      newOrder = sortOn !== sort.sortOn || !sort.asc;
    }
    let sortedData = {};
    switch (view) {
      case 'mainScreen':
        sortedData = this.sortData(data, sortOn, newOrder, 'label');
        break;
      case 'listSU':
        sortedData = this.sortData(data, sortOn, newOrder, 'displayName');
        break;
      case 'terminated':
        sortedData = this.sortData(data, sortOn, newOrder, 'campaignLabel');
        break;
      case 'campaignPortal':
        Object.assign(sortedData, data);
        sortedData.interviewers = this.sortData(
          data.interviewers,
          sortOn,
          newOrder,
          'CPinterviewer'
        );
        break;
      case 'monitoringTable': {
        Object.assign(sortedData, data);
        let mainAttr;
        if (data.linesDetails.length > 0) {
          if (data.linesDetails[0].site) {
            mainAttr = 'site';
          } else if (data.linesDetails[0].survey) {
            mainAttr = 'survey';
          } else {
            mainAttr = 'CPinterviewer';
          }
        }
        sortedData.linesDetails = this.sortData(data.linesDetails, sortOn, newOrder, mainAttr);
        break;
      }
      case 'review':
        Object.assign(sortedData, data);
        sortedData = this.sortData(data, sortOn, newOrder, 'interviewer');
        break;
      default:
        Object.assign(sortedData, data);
        break;
    }

    return [sortedData, { sortOn, asc: newOrder }];
  }

  static getCheckAllValue(checkboxArray, pagination) {
    const startIndex = pagination.size * (pagination.page - 1);
    const endIndex = Math.min(pagination.size * pagination.page, checkboxArray.length);

    return checkboxArray.slice(startIndex, endIndex).every(checkbox => checkbox.isChecked);
  }

  static getOnToggleChanges(id, checkboxArray, displayedLines, pagination) {
    const newCheckboxArray = displayedLines.map(element => {
      const checkboxArrayData = checkboxArray.find(data => data.id === element.id);

      return element.id !== id
        ? checkboxArrayData
        : { id: element.id, isChecked: !checkboxArrayData?.isChecked };
    });
    const newCheckAll = Utils.getCheckAllValue(newCheckboxArray, pagination);

    checkboxArray.forEach(element => {
      if (!displayedLines.some(line => line.id === element.id)) {
        newCheckboxArray.push(element);
      }
    });

    return { newCheckboxArray, newCheckAll };
  }

  static handleCheckAll(checkAllValue, checkboxArray, displayedLines, pagination) {
    const newCheckboxArray = displayedLines.map((data, index) => {
      const isWithinRange =
        index >= pagination.size * (pagination.page - 1) &&
        index < pagination.size * pagination.page;

      const checkboxData = checkboxArray.find(element => element.id === data.id);
      const isChecked = isWithinRange ? checkAllValue : checkboxData?.isChecked || false;

      return { id: data.id, isChecked };
    });

    checkboxArray.forEach(element => {
      if (!displayedLines.some(line => line.id === element.id)) {
        newCheckboxArray.push(element);
      }
    });

    return newCheckboxArray;
  }
}

export default Utils;
